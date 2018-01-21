from __future__ import print_function
from board import Board
from player import Player
import json


NUM_TURNS = 13
NUM_PLAYERS = 1

verbose = [1, 0]
pretty = 0

def printPretty(toPrint):
    if pretty:
        print(toPrint)

def main():
    printPretty('In Main')
    board = Board()

    if (board.G is None):
        printPretty('Generated board is null')
        return

    players = []
    for i in range(1, 1+NUM_PLAYERS):
        players.append(Player(i))

    run_game(board, players)

def run_game(board, players):
    # construct the output starting from here
    data = {}
    # an array where index:turn, val:dict of board, placements and movements
    # placeholder version right now, update this later.
    data["state"] = []

    for i in range(NUM_TURNS):

        curr_turn = {}

        for j in range(NUM_PLAYERS):

            curr_turn[str(1+j)] = {}

            printPretty('Running Turn for ' + str(j) + ' Iteration: \n' + str(i))

            if (verbose[1]):
                printPretty('State of the board before: \n' + str(board.G.nodes(data=True)));

            curr_player = players[j]

            # Player IDs start at 1, so we use 1+j instead of j
            nodes, player = board.get_owned_nodes(1+j)
            printPretty("nodes: "+str(nodes))

            # Adding nodes for the current player turn into the player key
            curr_turn[str(1+j)]["nodes"] = nodes;

            # Placement Turn
            curr_player.init_turn(board.G.copy(), nodes, player['gain'])
            placements = curr_player.player_place_units()
            board.G, board.players = board.check_moves(placements, 1+j)

            # Adding placement data into the player key
            curr_turn[str(1+j)]["placement"] = placements;

            if (verbose[0]):
                printPretty('Player: ' + str(j+1) + ' Placement: \n' + str(placements))
                printPretty('State of the board after : \n' + str(board.G.nodes(data=True)))

            if board.G is None or board.players is None:
                printPretty('Check moves failed after placement')
                printPretty(board.players)
                return


            # Movement Turn
            curr_player.init_turn(board.G.copy(), nodes, player['gain'])
            movements = curr_player.player_move_units()
            printPretty('State of the board after : \n' + str(board.G.nodes(data=True)))
            board.G, board.players = board.check_moves(movements, 1+j)

            # Adding placement data into the player key
            curr_turn[str(1+j)]["moves"] = movements;

            if (verbose[0]):
                printPretty('Player: ' + str(j+1) + ' Movements: \n' + str(movements))
                printPretty('State of the board after :\n ' + str(board.G.nodes(data=True)))

            if board.G is None or board.players is None:
                printPretty('Check moves failed after movement')
                printPretty (board.G)
                printPretty (board.players)
                return

            if (verbose[1]):
                printPretty('State of the board after : \n' + str(board.G.nodes(data=True)))
        data["state"].append(curr_turn)
    jsonData = json.dumps(data)
    print(jsonData,end="")
main()
