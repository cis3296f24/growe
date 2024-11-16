```mermaid
sequenceDiagram
  participant User
  participant Auth
  participant Server
  participant Database

  User ->> Auth : Enter Email
  Auth ->> Server : Store Email
  Server --> Database : Check Email Exists
  Database -->> Server : Validate Email
  Server -->> Auth : Validate Step
  User ->> Auth : Enter Username and Display Name
  Auth ->> Server : Store Username
  Server --> Database : Check Username Exists
  Database -->> Server : Validate Username
  Server -->> Auth : Validate Step
  User ->> Auth : Enter Password
  User ->> Auth : Request Sign Up
  Auth ->> Server : Handle Sign Up
  Server --> Database : Add User
  Database -->> Server : Return User
  Server -->> Auth : Return User
  Auth -->> User : Serve Home Screen
  
```

[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=16892524)
<div align="center">

# Growe

[![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://console.firebase.google.com/u/0/project/growe-5d9d1/overview)
[![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)](https://temple-cis-projects-in-cs.atlassian.net/jira/software/c/projects/GROWE/boards/283)
[![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/board/lPTN0ZjN7KUt5Ndh2Y05bQ/growe?node-id=0-1&t=t5s6KC1w27zvGpuE-1)

[![Report Issue on Jira](https://img.shields.io/badge/Report%20Issues-Jira-0052CC?style=flat&logo=jira-software)](https://temple-cis-projects-in-cs.atlassian.net/jira/software/c/projects/DT/issues)
[![Deploy Docs](https://github.com/ApplebaumIan/tu-cis-4398-docs-template/actions/workflows/deploy.yml/badge.svg)](https://github.com/ApplebaumIan/tu-cis-4398-docs-template/actions/workflows/deploy.yml)
[![Documentation Website Link](https://img.shields.io/badge/-Documentation%20Website-brightgreen)](https://applebaumian.github.io/tu-cis-4398-docs-template/)

</div>

![header](https://github.com/user-attachments/assets/467dadec-f26a-4e7a-a6b4-07da37c17b6c)

# Abstract
A collaborative habit-building app that leverages social accountability to help users establish and maintain positive routines. Users join groups centered around specific habits—such as cleaning, going to the library to study, or exercising—and participate in check-ins that require evidence of their progress in the form of photos (like BeReal). Group members validate each other's check-ins, creating a supportive community that fosters commitment and consistency. If users cumulatively miss the required number of check ins, not only does the streak visibly reset but a beautiful unique plant that was once growing is uprooted and reset (like Forest), adding a gentle layer of peer accountability. To motivate ongoing participation, consistent users earn badges and unlock new plants. By combining habit tracking with peer validation, this idea transforms personal goal-setting into a shared journey, enhancing motivation through collective encouragement and accountability.

**Keywords**: 005, accountability, habits, social, expo, firebase

# Requirements
This app uses React Native Expo as a frontend mobile framework, Firebase as a backend for storing user data, assets, and group data. It also will likely use Stable Diffusion 3.5 Large to generate assets.

# Design
A collaborative habit-building app that leverages social accountability to help users establish and maintain positive routines.

## Asset Generation

<p float="left">
  <img src="https://github.com/user-attachments/assets/109b6902-9ff9-4304-9160-828614c94017" height="200" />
  <img src="https://github.com/user-attachments/assets/e8fda27a-add0-45ff-b867-69748d9d1b91" height="200" /> 
  <img src="https://github.com/user-attachments/assets/628e7f1c-ba03-4179-be34-7ad2e77590ba" height="200" />
</p>

_Examples of generating plant assets with Stable Diffusion 3.5 Large._

| Setting            | Value                                                                                                             |
|--------------------|-------------------------------------------------------------------------------------------------------------------|
| **Prompt**         | isolated `{plant_name}` plant at the `{growth_stage}`, white background, isometric perspective, 8-bit pixel art style |
| **Aspect Ratio**   | 1:1                                                                                                               |
| **CFG**            | 3.5                                                                                                               |
| **Prompt Strength**| 0.85 (1.0 might be better)                                                                                        |
| **Steps**          | 40 (35 might be better)                                                                                           |
| **Seed**           | 227468720                                                                                                         |
| **Output Format**  | webp                                                                                                              |
| **Output Quality** | 90                                                                                                                |

_The settings to generate the previous examples. Curly brackets indicate arguments to the template prompt. Growth stages indicate the progression of the plant at a certain life cycle._

| State | Description |
|--------------------|-------------------------------------------------|
| **Sprouting** | sprouting stage where it germinates and grows its first leaf |
| **Seedling** | seedling stage where a small green shoot emerges above the soil with tiny leaves starting to spread |
| **Vegetating** | vegetating stage where the plant grows taller with thickening stems and broadening leaves |
| **Budding** | budding stage where the plant is transitioning to blooming and small buds appear signaling flower formation |
| **Flowering** | flowering stage where the plant displays fully opened and prominent flowers |
| **Fruiting** | fruiting stage where the plant produces fruits as the flowers fade |
| **Dying** | dying stage where the plant turns brown and wilts |
| **Dead** | dead plant |

**Yucca**

<p float="left">
  <img src="https://github.com/user-attachments/assets/2d712102-de27-4719-9c90-2dc03927fbeb" height="100" />
  <img src="https://github.com/user-attachments/assets/3c40cfb0-0f96-44e1-9303-ca75a15406b1" height="100" />
  <img src="https://github.com/user-attachments/assets/2e4768d0-d1c0-42a1-95f2-ae5389e6512c" height="100" />
  <img src="https://github.com/user-attachments/assets/a0ce1303-fbe8-4c27-8e14-806669470562" height="100" />
  <img src="https://github.com/user-attachments/assets/2820ed4a-ebe2-42be-83fb-56914d7c28e5" height="100" />
  <img src="https://github.com/user-attachments/assets/4183f56f-9718-46bd-8d34-d931caf9817a" height="100" />
</p>

**Bird of Paradise**

<p float="left">
  <img src="https://github.com/user-attachments/assets/05997a85-9ffa-4de5-b2d3-47ea4ce2d5a0" height="100" />
  <img src="https://github.com/user-attachments/assets/369f754a-e252-4daa-bbc9-1bec7736c734" height="100" />
  <img src="https://github.com/user-attachments/assets/66cc6241-50ea-4f16-a561-9caeb89ca744" height="100" />
  <img src="https://github.com/user-attachments/assets/fb3937b1-d333-4845-8ab2-cf4799dc7653" height="100" />
  <img src="https://github.com/user-attachments/assets/7ac915b2-1a95-4074-a289-9330aae3689b" height="100" />
  <img src="https://github.com/user-attachments/assets/8c2b9dbf-6f9a-4792-8c6f-bb6ff2b747f0" height="100" />
</p>

## Mechanics

### Credits

Users earn credits in a few ways:

1. Each time the user logs a habit for the week (even if the plant dies at the end of the week). User earns extra credits if they log more habits than necessary for the week.
2. Each time the team successfully grows a plant for the week.
3. Every day each plant in the garden is kept alive users can collect a small amount of credits from each plant.

Users can use their credits to buy things for the garden, like pets, paths, decorations, and food to keep the existing plants and animals in the garden alive.

Here are the items planned so far:
| Item | Description |
|--------------------|-------------------------------------------------|
| **Pets** | Animated NPCs that allow plants to live longer without **Fertilizer** |
| **Decorations** | Purely cosmetic items that spruce up the users' garden |
| **Kibble** | Food for **Pets** that keep them alive and healthy |
| **Fertilizer** | Food for plants that keep them alive and healthy |
| **Gaia** | A magic stone that allows users a 50% chance to save a plant that died |

### Unique Events

Events that allow users to skip feeding their existing plants for the week.

- It will randomly rain on occasion.
- A rainbow will appear.
- Rare animal visiting.

### Habit Guidance

Provide guidance on how to choose and formulate a good habit.

### Nudges

If users are not meeting goals consistently or are constantly exceeding goals, give nudges for recommendations to adjust.

### Reflection

Users can write an optional reflection that gives them the opportunity to write about their high and low of the week. Pair this with rewarding animations of the plant and pets.

### Badges

Certain badges are rewarded for unique accomplishments.

### Streaks

Streaks of multiple weeks of successfully growing a plant give users the opportunity to keep growing. Maybe give the opportunity to plant a tree at long term streak?

### Pledges

Make pledges at the beginning of the week to commit to n days that will log a habit. Get extra credit if user logs on those predicted days.

## User Interface

<p float="left">
  <img src="https://github.com/user-attachments/assets/9dc53ade-f544-42b5-b597-d12722d1352b" height="400" />
  <img src="https://github.com/user-attachments/assets/94e51c34-6207-4255-ad9b-49b486043f12" height="400" />
  <img src="https://github.com/user-attachments/assets/ecf115d0-9eb9-4460-ab12-70a585fec0e6" height="400" />
  <img src="https://github.com/user-attachments/assets/a1b81ae8-9c2d-4b27-abc3-f82c1df9ee5d" height="400" />
  <img src="https://github.com/user-attachments/assets/7b2318d4-3fc0-440d-90e4-b05e749f1067" height="400" />
  <img src="https://github.com/user-attachments/assets/81a28e94-d5fc-476c-9ac9-e22dcfedd989" height="400" />
  <img src="https://github.com/user-attachments/assets/cec70125-a9c1-4847-bd50-a8e3a67bc51d" height="400" />
</p>

## Database Collections
![image](https://github.com/user-attachments/assets/d75d778b-dfd5-48a8-9ebf-9c1a5a25be94)

## Class Diagram

```mermaid
classDiagram
  RootLayout *-- Index : composes
  RootLayout o-- Header : aggregates
  RootLayout o-- Footer : aggregates
  RootLayout o-- UserProvider : aggregates
  Index *-- Auth : composes
  GroupLayout *-- Group : composes
  HomeLayout *-- Garden : composes
  LogLayout *-- Camera : composes
  SettingsLayout *-- Settings : composes
  Auth ..> HomeLayout : navigates
  Footer ..> HomeLayout : navigates
  Footer ..> LogLayout : navigates
  Footer ..> GroupLayout : navigates
  Garden ..> GroupLayout : navigates
  Header ..> SettingsLayout : navigates
  Group ..> Plant : navigates
  UserProvider ..|> UserContextType : implements
  Auth --> useUser : uses
  Camera --> useUser : uses
  Garden --> useUser : uses
  Group --> useUser : uses
  
  
  class RootLayout {
    +usePathname<Pathname> pathname
    +boolean isIndexPage
  }
  class Index
  class GroupLayout
  class HomeLayout
  class LogLayout
  class SettingsLayout
  class Auth {
    +useRouter<Router> router
    +useState<Step> step
    +useState<string> email
    +useState<string> username
    +useState<string> displayName
    +useState<string> password
    +useUser<User> user
    +useState<boolean> loading
    +useState<string> error
    +useState<boolean> emailValid
    +handleSignUp()
    +handleStep(newStep)
    +handleLogin()
    +handleLogout()
    +handleCheckUsername()
    +isValidEmail(email) : boolean
    +handleCheckEmail()
    +handleLoginPassword()
    +handleResetPassword()
  }
  class Camera {
    +useState<CameraType> facing
    +useCameraPermissions<CameraPermissions> permission
    +useUser<User> user
    +useRef<CameraView> cameraRef
    +useState<string | null> photoUri
    +useState<boolean> isPreviewVisible
    +toggleCameraFacing()
    +takePictureAndShowPreview()
    +uploadPicture()
    +retakePicture()
    +createLogEntry(imageUrl)
  }
  class Footer {
    +useRouter<Router> router
    +useState<string> selected
    +usePathname<Pathname> pathname
    +handlePress(screen)
  }
  class Garden {
    +useRouter<Router> router
    +useUser<User> user
    +useState<DocumentReference[]> groups
    +useState<boolean> hasGroups
  }
  class Group {
    +useState<Step> step
    +useState<DocumentReference[]> groups
    +useState<boolean> hasGroups
    +useUser<User> user
    +userState<string> groupName
    +useState<string> codeInput
    +useState<string> habit
    +useState<string> error
    +useState<DocumentReference[]> groupMembers
    +useState<string> groupCode
    +useState<string[]> groupMemberNames
    +fetchGroups() string
    +handleCreateGroup()
    +handleJoinGroup()
    +handleStep(step)
    +handleFrequency(newFrequency)
  }
  class Header {
    +useState<boolean> isEnabled
    +boolean toggleSwitch
  }
  class Plant
  class Settings
  class UserProvider {
    +useUser<User | null> user
  }
  class useUser {
    +useContext(UserContext) context
  }
  class UserContextType {
    +User user
  }
```

# Background
This is the life cycle of a user on this app for a three person group with the goal to workout 3 days a week:

1. User creates account.
8. Add friends by username.
9. Create group.
10. Choose a habit. A good example is to go for a run 3 days a week. A bad example is run 1 mile three days a week. It shouldn't need to be quantified, only specific enough that can be verified from a simple photo. qualitative > quantitative.
11. Set minimum frequency of check-in (i.e. work out 3 days a week).
12. Invite friends to join.
13. At the start of every period (i.e. week), given a library of plants to choose from (will auto-pick if not chosen). plants are standard and take minimum frequency (i.e. 3 users * 3 days = 9 total check-ins for the week), while accessories to the garden may take a multiplier of more check-ins (i.e. 3 users * 3 days + 3 extra = 12 total check-ins for the week).
14. Users take a picture of their workout (not from camera roll) at their discretion three times on separate days of the week.
15. Users must endorse it as valid, can also upvote and comment.
16. Every time a user's check-in is endorsed as valid by everyone, the plant or accessory grows or progresses respectively.
17. If users do not collectively reach the required number of check-ins, the plant that was growing dies.
18. Repeat from step 9.

# References
- https://bereal.com/
- https://www.forestapp.cc/
- https://expo.dev/
- https://openai.com/index/dall-e-3/


## Collaborators

[//]: # ( readme: collaborators -start )
<table>
<tr>
    <td align="center">
        <a href="https://github.com/gutbash">
            <img src="https://avatars.githubusercontent.com/u/44552816?v=4" width="100;" alt="gutbash"/>
            <br />
            <sub><b>Bash</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/khanhquocng2801">
            <img src="https://avatars.githubusercontent.com/u/102694034?v=4" width="100;" alt="khanhquocng2801"/>
            <br />
            <sub><b>Khan</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/omarshakir8">
            <img src="https://avatars.githubusercontent.com/u/71716775?v=4" width="100;" alt="omarshakir8"/>
            <br />
            <sub><b>Omar</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Ruben-amalgam">
            <img src="https://avatars.githubusercontent.com/u/171351822?v=4" width="100;" alt="Ruben-amalgam"/>
            <br />
            <sub><b>Ruben</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/tus29603">
            <img src="https://avatars.githubusercontent.com/u/157152397?v=4" width="100;" alt="tus29603"/>
            <br />
            <sub><b>Tes</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/Youngdoul">
            <img src="https://avatars.githubusercontent.com/u/157045613?v=4" width="100;" alt="Youngdoul"/>
            <br />
            <sub><b>Doul</b></sub>
        </a>
    </td>
</tr>
</table>

[//]: # ( readme: collaborators -end )
