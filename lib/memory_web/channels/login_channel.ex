# starts Game from the login page

defmodule MemoryWeb.LoginChannel do
  use MemoryWeb, :channel

  def join("login", payload, socket) do
      {:ok, socket}
  end

  #starts GameRegistry in order to create a game
  def handle_in("create_game", %{"name" => name}, socket) do
    Memory.GameRegistry.start(name)
    {:reply, {:ok, %{name: name}}, socket}
  end
end
