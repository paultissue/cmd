# 🤖 !cmd Shout-out Service 
      
Universal Cross-Platform Chatbot Command Router

The **`!cmd` Shout Service** is a high-performance, edge-deployed Cloudflare Worker designed to serve as a **Universal Cross-Platform Chatbot Command Router**. It abstracts and standardizes custom command handling across multiple live-streaming chat platforms, eliminating the need to maintain redundant, platform-specific command blocks. 

## 📋 Supported Commands Directory (`cmd.commands.jsonc`)

The service supports a comprehensive set of built-in utility commands, argument-based macros, and creator shout-outs.

### 🛠️ Built-in & General Utility Commands

| Command | Aliases | Description / Response Template |
| --- | --- | --- |
| `usage` | `syntax` | ℹ️ Usage: `!cmd <command_name> [args]` |
| `c` | `cmds`, `commands`, `list`, `docs`, `help`, `?` | 🤖 Presents URL to the dynamic commands webpage. |
| `f` | `fu`, `fair`, `fairuse` | ℹ️ Fair use policy disclaimer for commentary and critique. |
| `g` | `cg`, `guide`, `guidelines` | ℹ️ YouTube Community Guidelines reference link. |
| `h` | `hs`, `hate`, `speech` | ℹ️ YouTube Hate Speech Policy reference link. |
| `m` | `mute`, `muted`, `priv`, `sec` | 🔇 Sound MUTED for PRIVACY and/or SECURITY. Please stand by... 🔇 |
| `r` | `respect` | ⚠️ Reminder to maintain respectful chat decorum. |
| `share` | `stream` | 📢 Shout-outs to social media content providers to follow and support. |
| `sp` | `spam` | ⚠️ Anti-spam and readability guidelines reminder. |
| `st` | `status`, `verify`, `access` | ✅ Status check verified: You are authorized! |
| `sub` | `subscribe`, `support` | 👍 Full subscription and engagement support reminder (Thumbs Up, Subscribe, Notifications, Super Chat). |
| `subx` | `subscribex`, `supportx` | 👍 Standard subscription support reminder (Thumbs Up, Subscribe, Notifications). |
| `t` | `tech`, `issue`, `buffer` | ⚠️ Technical difficulties notice. |

### 🔤 Argument-Based Commands (Dynamic Interpolation)

| Command | Aliases | Response Template & Behavior |
| --- | --- | --- |
| `l` | `likes` | 👍 `$(1)` Thumbs Up 👍 Smash that Like button! 👍 ...Let's Goooo! 🇺🇸 |
| `p` | `promo`, `promote`, `so`, `shout` | 📢 Go follow `$(1)` | 📺 `https://www.youtube.com/$(1)` |
| `s` | `subs`, `subscribers` | 👥 `$(1)` Subscribers 👥 Smash that Subscribe button! 👥 ...Let's Goooo! 🇺🇸 |
| `w` | `watchers`, `watching` | 👀 `$(1)` Watching 👀 ...Let's Goooo! 🇺🇸 |

### 📺 Creator Shout-out Commands (Sample Highlights)

*Note: Full aliases are registered for each creator. Below is a representative selection:*

* **`ao`** (`angry`, `oregon`): 📢 The Angry Oregonian 🇺🇸 | 📺 `@TheAngryOregonian1776` | CashApp / Venmo
* **`cs`** (`chris`, `sims`): 📢 Chris Sims 🇺🇸 | 📺 `@ChrisxSims` | 💬 `@ChrisxSims` | CashApp / Venmo
* **`dr`** (`danny`, `rebel`): 📢 Danny Rebel 🇺🇸 | 📺 `@DannyRebel333` | 💬 `@DannyRebel333` | CashApp / Venmo
* **`ht`** (`hoot`, `hooty`, `hoot_troop`): 📢 Hoot Troop 🇺🇸 | 📺 `@Hoot_Troop` | 💬 `@Hoot_Troop` | CashApp / Linktr.ee
* **`mb`** (`bill`, `onlyamrbill`): 📢 Mr. Bill 🇺🇸 | 📺 `@OnlyaMrBill` | 💬 `@OnlyaMrBill` | CashApp / Venmo
* **`ns`** (`nick`, `shirley`): 📢 Nick Shirley 🇺🇸 | 📺 `@NickShirley` | 💬 Instagram | 🔗 Official Site
* **`uc`** (`unscripted`, `adn`): 📢 Unscripted Chronicles (PJ) 🇺🇸 | 📺 `@Unscripted-1437` | 💬 `@Pjsjourney82` | PayPal / Linktr.ee

## 💬 Usage Examples in Live Video Chat

When viewers or moderators type `!cmd` commands in a live stream chat, the chatbot triggers the Cloudflare Worker endpoint, which interpolates arguments and returns the formatted response.

### Example 1: Standard Static Utility Command

* **Chat Input**:
```text
!sub
```

* **Bot Response**:
```text
ℹ️ Support this channel! 🇺🇸 Press Thumbs Up 👍, Subscribe 🔔, Set Notifications to All 🔔, and Super Chat 💵 | Thank you!
```

### Example 2: Dynamic Shout-Out / Promotion Command (`!p`)

* **Chat Input**:
```text
!p @NickShirley
```

* **Processing**: The interpolation engine maps `@NickShirley` into `$(1)`.
* **Bot Response**:
```text
📢 Go follow @NickShirley | 📺 [https://www.youtube.com/@NickShirley](https://www.youtube.com/@NickShirley)
```

### Example 3: Creator Shortcut Command (`!ns`)

* **Chat Input**:
```text
!ns
```

* **Bot Response**:
```text
📢 Nick Shirley 🇺🇸 | 📺 [https://www.youtube.com/@NickShirley](https://www.youtube.com/@NickShirley) | 💬 [https://www.instagram.com/nickshirley](https://www.instagram.com/nickshirley) | 💸 [https://officialnickshirley.us](https://officialnickshirley.us)
```

### Example 4: Viewer Watcher Count Macro (`!w`)

* **Chat Input**:
```text
!w 1,450
```

* **Bot Response**:
```text
👀 1,450 Watching 👀 ...Let's Goooo! 🇺🇸
```

## 🏗️ Core Architecture & Functionality

By fetching centralized JSON/text definitions hosted on GitHub (commands, authorized users, and active channels), this service dynamically resolves chat commands, applies variable interpolation, sanitizes outputs, and delivers consistent responses across various chatbot integrations.

### 1. Request Flow & Routing

* **Root Route (`/`)**: Intercepts chat bot API calls, extracts query parameters, platform headers, and user info, validates permissions against authorized user and channel lists, and routes execution to built-in overrides or custom JSON command templates.
* **Dynamic Endpoints**:
  * `/commands`: Renders an interactive, theme-toggleable HTML table view or raw JSON/text view of all active commands and aliases.
  * `/users`: Displays authorized user whitelists.
  * `/channels`: Displays authorized channel whitelists.

### 2. Security & Sanitization

* **In-Memory Caching with TTL**: Caches configuration files (`cmd.commands.jsonc`, `cmd.users.txt`, `cmd.channels.txt`) with a 60-second Time-To-Live (TTL) and promise deduplication to ensure lightning-fast edge performance.
* **Strict Sanitization**: Automatically strips invisible zero-width characters (ZWSP, ZWJ, BOM, NBSP), control codes, and duplicate whitespace to prevent chat filter violations or hidden payload injection.
* **Parameter Alias Normalization**: Maps diverse platform parameter keys (`c`, `cmd`, `u`, `usr`, `q`, `query`, `ch`, `channel`, `p`, `platform`) into unified internal representations.

## 🤖 Platform Configuration & Custom Command Setup

To integrate the `!cmd` service with your chatbot, create a custom command pointing to your Cloudflare Worker URL (`https://cmd.paultissue.workers.dev/`). Below are the custom command setups for each supported chatbot.

### 1. StreamElements

* **Quirk**: Re-sorts or drops empty query parameters if macros evaluate to blank. Requires explicit fallback syntax (`${1:|EMPTY}`) to prevent dropping single-word triggers.

* **Minimal Command Setup**:
```text
  !cmd ${customapi [https://cmd.paultissue.workers.dev/?query=$](https://cmd.paultissue.workers.dev/?query=$){1:|EMPTY}}
```

* **Full Authenticated Command Setup**:
```text
!cmd ${customapi [https://cmd.paultissue.workers.dev/?platform=StreamElements&channel=@$](https://cmd.paultissue.workers.dev/?platform=StreamElements&channel=@$){channel}&user=${sender}&query=${1:|EMPTY}}
```

### 2. Nightbot

* **Quirk**: Pass remaining query text natively via `q=${query}` or `q=${querystring}`.
* **Minimal Command Setup**:
```text
!cmd $(customapi [https://cmd.paultissue.workers.dev/?query=$(querystring](https://cmd.paultissue.workers.dev/?query=$(querystring)))
```

* **Full Authenticated Command Setup**:
```text
!cmd $(customapi [https://cmd.paultissue.workers.dev/?platform=Nightbot&channel=@PaulTissue&user=$(user)&query=$(querystring](https://cmd.paultissue.workers.dev/?platform=Nightbot&channel=@PaulTissue&user=$(user)&query=$(querystring)))
```

### 3. Fossabot

* **Quirk**: Pass remaining query text natively via `q=${query}` or `q=${querystring}`.
* **Minimal Command Setup**:
```text
!cmd $(customapi [https://cmd.paultissue.workers.dev/?query=$(querystring](https://cmd.paultissue.workers.dev/?query=$(querystring)))
```

* **Full Authenticated Command Setup**:
```text
!cmd $(customapi [https://cmd.paultissue.workers.dev/?platform=Fossabot&channel=$](https://cmd.paultissue.workers.dev/?platform=Fossabot&channel=$){channel}&user=${sender}&query=$(querystring))
```

### 4. Streamlabs Cloudbot

* **Quirk**: Uses variable injection via `$(sender)` and `$(query)`, and short parameters (`u` & `m`) to bypass dashboard field truncation limits.
* **Minimal Command Setup**:
```text
!cmd {readapi.[https://cmd.paultissue.workers.dev/?query=](https://cmd.paultissue.workers.dev/?query=){touser.name}}
```

* **Full Authenticated Command Setup**:
```text
!cmd {readapi.[https://cmd.paultissue.workers.dev/?platform=Cloudbot&channel=@PaulTissue&user=](https://cmd.paultissue.workers.dev/?platform=Cloudbot&channel=@PaulTissue&user=){user.name}&query={touser.name}}
```

### 5. Streamer.bot

* **Quirk**: Requires Command Location set to 'Starts With' to pass trailing parameters into `%rawInput%`.
* **Action Setup**:
* **Sub-Action**: Core ➔ Network ➔ Fetch URL
* **URL**: `https://cmd.paultissue.workers.dev/?platform=Streamer.bot&channel=%channel%&user=%user%&query=%rawInputUrlEncoded%`

### 6. BotRix

* **Status**: ❌ Not supported (`fetch[...]` does not work natively within BotRix script execution constraints).

## 🛠️ Repository File Structure

* `cmd.paultissue.workers.dev.js`: The core Cloudflare Worker script handling routing, authentication, parsing, and HTML rendering.
* `cmd.commands.jsonc`: JSONC configuration file containing all command keys, response templates, and aliases.
* `cmd.users.txt`: Whitelist of authorized usernames permitted to execute administrative commands.
* `cmd.channels.txt`: Whitelist of authorized streaming channels.
