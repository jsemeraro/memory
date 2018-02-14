defmodule Memory.Game do
    use Agent

    def start_link(name) do
        b = initBoard()
        renderBoard = %{0 => %{0 => "", 1 => "", 2 => "", 3 => ""},
                        1 => %{0 => "", 1 => "", 2 => "", 3 => ""},
                        2 => %{0 => "", 1 => "", 2 => "", 3 => ""},
                        3 => %{0 => "", 1 => "", 2 => "", 3 => ""}}
        Agent.start_link(fn -> 
            %{name: name, board: b, firstCoords: nil, secondCoords: nil, renderBoard: renderBoard, guesses: 0} 
        end, name: reg(name))
    end

    def reg(name) do
        {:via, Registry, {Memory.GameRegistry, name}}
    end

    def client_view(agent) do
        state = Agent.get(agent, fn state -> state end)
        %{
            board: Map.get(state, :renderBoard), 
            guesses: Map.get(state, :guesses),
            dontGuess: is_nil(Map.get(state, :firstCoords)) || is_nil(Map.get(state, :secondCoords))
        }
    end

    # add to :guesses
    # add the :firstCoords and :secondCoords to the state
    # add the letter on the renderBoard
    def flip(agent, coords) do
        state = Agent.get(agent, fn state -> state end)
        firstCoords = Map.get(state, :firstCoords)
        secondCoords = Map.get(state, :secondCoords)

        cond do
            is_nil(firstCoords) ->
                Agent.update(agent, fn state -> 
                    state = Map.put(state, :guesses, Map.get(state, :guesses)+1)
                    state = Map.put(state, :firstCoords, coords)
                    renderBoard = updateRenderBoard(state, Map.get(state, :firstCoords))
                    Map.put(state, :renderBoard, renderBoard)
                end)

            is_nil(secondCoords) ->
                Agent.update(agent, fn state -> 
                    state = Map.put(state, :guesses, Map.get(state, :guesses)+1)
                    state = Map.put(state, :secondCoords, coords)
                    renderBoard = updateRenderBoard(state, Map.get(state, :secondCoords))
                    Map.put(state, :renderBoard, renderBoard)
                end)
                # guess(agent)
            true ->
                Agent.get(agent, fn state -> state end)
        end

        Agent.get(agent, fn state -> state end)
    end

    def guess(agent) do
        IO.puts("In Guess")
        state = Agent.get(agent, fn state -> state end)
        board = Map.get(state, :board)
        firstCoord = Map.get(state, :firstCoords)
        secCoord = Map.get(state, :secondCoords)

        # update state renderBoard with our match
        if isMatch(board, firstCoord, secCoord) do
            Agent.update(agent, fn state ->
                state = Map.put(state, :renderBoard, updateRenderBoard(state, firstCoord, secCoord))
                state = Map.put(state, :firstCoords, nil)
                Map.put(state, :secondCoords, nil)
            end)
        # clear the guess if it's wrong
        else
            Agent.update(agent, fn state ->
                state = Map.put(state, :renderBoard, clearCoords(state, firstCoord, secCoord))
                state = Map.put(state, :firstCoords, nil)
                Map.put(state, :secondCoords, nil)
            end)
        end
    end

    # clear the coordinates here
    defp clearCoords(state, coord1, coord2) do
        renderBoard = Map.get(state, :renderBoard)

        x1 = String.to_integer(List.first(coord1))
        y1 = String.to_integer(List.last(coord1))
        x2 = String.to_integer(List.first(coord2))
        y2 = String.to_integer(List.last(coord2))

        x1Map = renderBoard[x1]
        x2Map = renderBoard[x2]

        renderBoard = Map.put(renderBoard, x1, Map.put(x1Map, y1, ""))
        Map.put(renderBoard, x2, Map.put(x2Map, y2, ""))
    end

    defp updateRenderBoard(state, coords1, coords2) do
        board = Map.get(state, :board)
        renderBoard = Map.get(state, :renderBoard)

        x1 = String.to_integer(List.first(coords1))
        y1 = String.to_integer(List.last(coords1))
        x2 = String.to_integer(List.first(coords2))
        y2 = String.to_integer(List.last(coords2))

        let1 = board[x1][y1]
        let2 = board[x2][y2]

        x1Map = renderBoard[x1]
        x2Map = renderBoard[x2]

        renderBoard = Map.put(renderBoard, x1, Map.put(x1Map, y1, let1))
        Map.put(renderBoard, x2, Map.put(x2Map, y2, let2))
    end

    defp updateRenderBoard(state, coord) do
        board = Map.get(state, :board)
        renderBoard = Map.get(state, :renderBoard)

        x = String.to_integer(List.first(coord))
        y = String.to_integer(List.last(coord))
        let = board[x][y]
        xMap = renderBoard[x]
        Map.put(renderBoard, x, Map.put(xMap, y, let))
    end

    defp isMatch(board, guess1, guess2) do
        x1 = String.to_integer(List.first(guess1))
        y1 = String.to_integer(List.last(guess1))
        x2 = String.to_integer(List.first(guess2))
        y2 = String.to_integer(List.last(guess2))

        board[x1][y1] == board[x2][y2]
    end

    # initialize board
    defp initBoard() do
        letters = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]
        board = %{0 => %{}, 1 => %{}, 2 => %{}, 3 => %{}}
        buildBoard(board, letters, 0, 0)
    end

    defp buildBoard(map, list, indX, indY) do
        cond do
            (indY == 3) and (indX == 3) ->
                let = elem(List.pop_at(list, Enum.random(0..Enum.count(list)-1)), 0)
                Map.put(map, indX, Map.put_new(map[indX], indY, let))
            indY == 3 ->
                {let, newList} = List.pop_at(list, Enum.random(0..Enum.count(list)-1))
                map = Map.put(map, indX, Map.put_new(map[indX], indY, let))
                buildBoard(map, newList, indX+1, 0)
            true -> 
                {let, newList} = List.pop_at(list, Enum.random(0..Enum.count(list)-1))
                map = Map.put(map, indX, Map.put_new(map[indX], indY, let))
                buildBoard(map, newList, indX, indY+1)
        end
    end
end