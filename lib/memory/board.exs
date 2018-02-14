defmodule Board do
    def initBoard() do
        letters = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]
        board = %{0 => %{}, 1 => %{}, 2 => %{}, 3 => %{}}
        buildBoard(board, letters, 0, 0)
    end

    def buildBoard(map, list, indX, indY) do
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
