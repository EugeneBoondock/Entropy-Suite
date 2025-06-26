# adventure_game_fixed.py
import random

# Game Setup
player_inventory = []
player_health = 100

# Locations
locations = {
    "forest": {
        "description": "You are in a dark forest. Sunlight barely penetrates the dense canopy.",
        "exits": {"north": "clearing", "east": "river"},
        "items": ["stick"],
    },
    "clearing": {
        "description": "A small clearing. A path leads north.",
        "exits": {"south": "forest", "north": "cave"},
        "items": ["rock"],
    },
    "cave": {
        "description": "A dark cave. You can hear dripping water.",
        "exits": {"south": "clearing"},
        "items": ["rusty_key"],
    },
    "river": {
        "description": "A fast flowing river.",
        "exits": {"west": "forest"},
        "items": []
    }
}

current_location = "forest"

# Items
items = {
    "stick": {"description": "A sturdy wooden stick."},
    "rock": {"description": "A small, gray rock."},
    "rusty_key": {"description": "A rusty key."}
}

# Game Functions
def show_location():
    print("\n" + locations[current_location]["description"])
    if locations[current_location].get("items"):
        item_list = ", ".join(locations[current_location]["items"])
        print(f"You see: {item_list}")
    if locations[current_location].get("exits"):
        exits = ", ".join(locations[current_location]["exits"].keys())
        print(f"Exits: {exits}")

def get_item(item_name):
    global current_location, player_inventory
    if item_name in locations[current_location].get("items", []):
        locations[current_location]["items"].remove(item_name)
        player_inventory.append(item_name)
        print(f"You picked up the {item_name}.")
    else:
        print(f"There is no {item_name} here.")

def drop_item(item_name):
    global current_location, player_inventory
    if item_name in player_inventory:
        player_inventory.remove(item_name)
        if "items" not in locations[current_location]:
            locations[current_location]["items"] = []
        locations[current_location]["items"].append(item_name)
        print(f"You dropped the {item_name}.")
    else:
        print(f"You don't have a {item_name}.")

def use_item(item_name):
    global current_location, player_inventory
    if item_name in player_inventory:
        if item_name == "rusty_key" and current_location == "cave":
            print("You use the rusty key. A secret passage opens!")
            locations["cave"]["exits"]["east"] = "treasure_room"
            locations["treasure_room"] = {
                "description": "A hidden treasure room filled with gold!",
                "exits": {"west": "cave"},
                "items": ["gold_coin"]
            }
            items["gold_coin"] = {"description": "A shiny gold coin!"}
        else:
            print(f"You use the {item_name}, but nothing happens.")
    else:
        print("You don't have that item.")

# Main Game Loop
def play_game():
    global current_location, player_inventory
    print("=== ADVENTURE GAME ===")
    print("Type 'help' for commands, 'quit' to exit")
    show_location()
    
    while True:
        command = input("> ").lower().split()
        if not command:
            continue

        action = command[0]
        
        if action == "quit":
            print("Thanks for playing!")
            break
        elif action == "help":
            print("\nCommands:")
            print("  go <direction>  - Move in a direction")
            print("  look           - Look around")
            print("  inventory      - Check your items")
            print("  get <item>     - Pick up an item")
            print("  drop <item>    - Drop an item")
            print("  use <item>     - Use an item")
            print("  health         - Check your health")
            print("  quit           - Exit the game")
        elif action == "go":
            direction = command[1] if len(command) > 1 else None
            if direction and direction in locations[current_location].get("exits", {}):
                current_location = locations[current_location]["exits"][direction]
                show_location()
            else:
                print("You can't go that way.")
        elif action == "look":
            show_location()
        elif action == "inventory":
            if player_inventory:
                print("You are carrying:")
                for item in player_inventory:
                    print(f"- {item}")
            else:
                print("You are not carrying anything.")
        elif action == "health":
            print(f"Health: {player_health}/100")
        elif action == "get":
            item_name = " ".join(command[1:]) if len(command) > 1 else None
            if item_name:
                get_item(item_name)
        elif action == "drop":
            item_name = " ".join(command[1:]) if len(command) > 1 else None
            if item_name:
                drop_item(item_name)
        elif action == "use":
            item_name = " ".join(command[1:]) if len(command) > 1 else None
            if item_name:
                use_item(item_name)
        else:
            print("I don't understand that command. Type 'help' for commands.")

# Start the game
if __name__ == "__main__":
    play_game() 