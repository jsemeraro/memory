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

  def handle_in("reset", %{}, socket) do
    Game.reset(socket.assigns[:game_agent])
    game = Game.client_view(socket.assigns[:game_agent])
    
    {:reply, {:ok, %{ "game" => game}}, socket}
  end


  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{}, socket) do
    Game.guess(socket.assigns[:game_agent])
    game = Game.client_view(socket.assigns[:game_agent])

    {:reply, {:ok, %{ "game" => game}}, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("flip", %{"coords" => coords}, socket) do
    Game.flip(socket.assigns[:game_agent], coords)
    game = Game.client_view(socket.assigns[:game_agent])
    
    {:reply, {:ok, %{"game" => game} }, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end