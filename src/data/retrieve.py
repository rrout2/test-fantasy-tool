from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playernextngames, commonteamroster, playerfantasyprofilebargraph
import json
import jsonpickle
import os

class TeamMatchup:
    def __init__(self, opponent_id: str, date: str):
        self.opponent_id = opponent_id
        self.date = date
    def __eq__(self, other):
        return self.opponent_id == other.opponent_id and self.date == other.date

class Team:
    def __init__(self, name: str, id: str, team_matchups: list[TeamMatchup] = [], abbr: str = None):
        self.name = name
        if abbr:
            self.abbr = abbr
        self.id = id
        self.team_matchups = team_matchups
    def __eq__(self, other):
        return self.id == other.id

class Matchup:
    def __init__(self, opponent: Team, date: str):
        self.opponent = opponent
        self.date = date
    def __eq__(self, other):
        return self.opponent == other.opponent and self.date == other.date

class Player:
    def __init__(self, name: str, id: str, team_id: str, team_name: str, matchups: list[Matchup], season_avg_fpts: float, last_five_avg_fpts: float = 0):
        self.name = name
        self.id = id
        self.team_id = team_id
        self.team_name = team_name
        self.matchups = matchups
        self.season_avg_fpts = season_avg_fpts
        self.last_five_avg_fpts = last_five_avg_fpts

    def __eq__(self, other):
        return self.id == other.id

print('retrieving players...')
active_players = players.get_active_players()

api_teams = teams.get_teams()
team_id_from_player_id = {}
team_name_from_player_id = {}
matchups_from_team_id: dict[str, list[Matchup]] = {}
name_from_team_id: dict[str, str] = {}
abbr_from_team_id: dict[str, str] = {}

print('retrieving rosters...')
for team in api_teams:
    team_id = team['id']
    roster = commonteamroster.CommonTeamRoster(team_id=team_id).common_team_roster.get_data_frame()
    name_from_team_id[team_id] = team['full_name']
    abbr_from_team_id[team_id] = team['abbreviation']
    for player in roster['PLAYER_ID']:
        team_id_from_player_id[player] = team_id
        team_name_from_player_id[player] = team['abbreviation']

def make_player(player):
    player_id = player['id']

    fantasy_data = playerfantasyprofilebargraph.PlayerFantasyProfileBarGraph(player_id, '2023-24')
    season_avg_fpts = float(fantasy_data.season_avg.get_data_frame()['NBA_FANTASY_PTS'][0])
    last_five_avg_fpts = float(fantasy_data.last_five_games_avg.get_data_frame()['NBA_FANTASY_PTS'][0])
    next_n_games = playernextngames.PlayerNextNGames(
        season_all='2023-24',
        player_id=player_id,
        number_of_games=82,
    ).get_data_frames()[0]


    away_ids: list[str] = next_n_games['VISITOR_TEAM_ID']
    home_ids: list[str] = next_n_games['HOME_TEAM_ID']
    game_dates: list[str] = next_n_games['GAME_DATE']
    matchups: list[Matchup] = []
    for away_id, home_id, game_date in zip(away_ids, home_ids, game_dates):
        is_away: bool = team_id_from_player_id[player_id] == away_id

        team_id = away_id if not is_away else home_id
        opponent_id = home_id if is_away else away_id

        opposing_team = Team(team_name_from_player_id[player_id], opponent_id)
        matchup = Matchup(opposing_team, game_date)
        matchups.append(matchup)

        if team_id not in matchups_from_team_id:
            matchups_from_team_id[team_id] = []
        if matchup not in matchups_from_team_id[team_id]:
            matchups_from_team_id[team_id].append(matchup)

    made_player = Player(
        player['full_name'],
        player_id,
        team_id_from_player_id[player_id],
        team_name_from_player_id[player_id],
        matchups,
        season_avg_fpts,
        last_five_avg_fpts,
    )

    return made_player

def write_to_file(path: str, object):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    f = open(path, "w")
    f.write(jsonpickle.encode(object))
    f.close()

player_list = []
skipped = []

print('assembling player data...')
for player in active_players:
    player_name = '{0} {1} ({2})'.format(
        player['last_name'],
        player['first_name'],
        player['id'],
    )

    for attempt in range(0, 3):
        try:
            made_player = make_player(player)
            player_list.append(made_player)
            break
        except:
            if attempt == 2:
                print('skipping {0}'.format(player_name))
                skipped.append(player_name)
            else:
                print('retrying {0}...'.format(player_name))

team_list = [
    Team(
        name_from_team_id[team_id],
        team_id,
        matchups_from_team_id[team_id],
        abbr_from_team_id[team_id] if abbr_from_team_id[team_id] else None,
    ) for team_id in matchups_from_team_id
]
print('writing to file...')
write_to_file('src/data/all_players.json', player_list)
write_to_file('src/data/all_teams.json', team_list)

