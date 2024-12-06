---
sidebar_position: 2
---

# System Block Diagram

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