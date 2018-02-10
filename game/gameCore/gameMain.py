from __future__ import print_function
from board import Board
from player import Player
import sys
import importlib
import json

NUM_TURNS = 100
NUM_PLAYERS = 4

VERBOSE = 0

def verbose_print(msg):
    if VERBOSE:
        print(msg)

def main():
    players = []
    global NUM_PLAYERS
    NUM_PLAYERS = len(sys.argv) - 1
    for i in range(1,NUM_PLAYERS + 1):
        try:
            input_module = importlib.import_module(sys.argv[i])
        except:
            print('Player module: ' + sys.argv[i] + ' not found.')
            raise
        players.append(input_module.Player(i))

    board = Board('ring')

    if (board.G is None):
        print('Error: Generated board is null')
        return


    run_game(board, players)

def run_game(board, players):
    # construct the output starting from here
    data = {}
    # an array where index:turn, val:dict of board, placements and movements
    # placeholder version right now, update this later.
    data["state"] = []
    data["board"] = board.format_for_vis()
    score = [0] * NUM_PLAYERS
    for i in range(NUM_TURNS):

        # board.draw()
        curr_turn = {}

        for j in range(NUM_PLAYERS):

            curr_turn[str(1+j)] = {}

            verbose_print('Running Turn for ' + str(j) + ' Iteration: ' + str(i))

            curr_player = players[j]

            # Player IDs start at 1, so we use 1+j instead of j
            nodes, player = board.get_owned_nodes(1+j)
            score[j] = len(nodes)
            if score[j] == 0:
                continue

            if (len(nodes) == 0):
                continue

            # Adding nodes for the current player turn into the player key


            # Placement Turn
            curr_player.init_turn(board.G.copy(), nodes, 4 + int(  (1-pow(.9,player['gain']))/(1-.9)   ))
            placements = curr_player.player_place_units()

            try:
                board.G, board.players = board.check_moves(placements, 1+j)
            except Exception as ex:
                verbose_print(ex)
                continue

            # Adding placement data into the player key

            if board.G is None or board.players is None:
                print('Check moves failed after placement. Illegal action detected')
                return

            curr_turn[str(1+j)]["placement"] = placements["place"];

            # Movement Turn
            curr_player.init_turn(board.G.copy(), nodes, player['gain'])

            try:
                movements = curr_player.player_move_units()
            except Exception as ex:
                verbose_print(ex)
                continue

            board.G, board.players = board.check_moves(movements, 1+j)

            # Adding placement data into the player key

            if board.G is None or board.players is None:
                print('Check moves failed after movement. Illegal action detected.')
                return

            curr_turn[str(1+j)]["moves"] = movements["move"];

        if (len(list(filter(lambda x: x > 0,score))) == 1):
            break

        data["state"].append(curr_turn)
    jsonData = json.dumps(data)
    print(jsonData,end="")
main()
