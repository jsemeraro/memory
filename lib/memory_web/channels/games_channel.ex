# adapted code from Nat's Hangman Game

defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      agent = Memory.GameRegistry.getAgent(name)
      socket = socket
      |> assign(:name, name)
      |> assign(:game_agent, agent)
      
      {:ok, %{"join" => name, "game" => Game.client_view(agent)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{"tile" =>  t}, socket) do
    game = Game.guess(socket.assigns[:game], t)

    # Memory.GameRegistry.save(socket.assigns[:name], game)

    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (games:lobby).
  # def handle_in("shout", payload, socket) do
  #   broadcast socket, "shout", payload
  #   {:noreply, socket}
  # end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
