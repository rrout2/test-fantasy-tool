from nba_api.stats.static import teams, players
from nba_api.stats.endpoints import playernextngames, commonteamroster
import json
import jsonpickle
import os

class Team:
    def __init__(self, name: str, id: str):
        self.name = name
        self.id = id

class Matchup:
    def __init__(self, opponent: Team, date: str):
        self.opponent = opponent
        self.date = date

class Player:
    def __init__(self, name: str, id: str, matchups: list[Matchup]):
        self.name = name
        self.id = id
        self.matchups = matchups

active_players = players.get_active_players()

api_teams = teams.get_teams()
team_id_from_player_id = {}
team_name_from_player_id = {}

for team in api_teams:
    roster = commonteamroster.CommonTeamRoster(team_id=team['id']).common_team_roster.get_data_frame()
    for player in roster['PLAYER_ID']:
        team_id_from_player_id[player] = team['id']
        team_name_from_player_id[player] = team['abbreviation']

def make_player(player):
    player_id = player['id']

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

        opponent_id = ''
        if is_away:
            opponent_id = home_id
        else:
            opponent_id = away_id

        matchup = Matchup(opponent=Team(name=team_name_from_player_id[player_id], id=opponent_id), date=game_date)
        matchups.append(matchup)

    made_player = Player(name=player['full_name'], id=player_id, matchups=matchups)

    return made_player

player_list = []
skipped = []
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

filename = 'players/all_players.json'

os.makedirs(os.path.dirname(filename), exist_ok=True)

f = open(filename, "w")
f.write(jsonpickle.encode(player_list))
f.close()

print('Skipped players:\n{0}'.format(skipped))
