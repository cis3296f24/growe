"use strict";(self.webpackChunkcreate_project_docs=self.webpackChunkcreate_project_docs||[]).push([[635],{29122:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>i,contentTitle:()=>o,default:()=>l,frontMatter:()=>r,metadata:()=>u,toc:()=>c});var t=s(74848),a=s(28453);const r={sidebar_position:2},o="System Block Diagram",u={id:"requirements/system-block-diagram",title:"System Block Diagram",description:"Class Diagram",source:"@site/docs/requirements/system-block-diagram.md",sourceDirName:"requirements",slug:"/requirements/system-block-diagram",permalink:"/growe/docs/requirements/system-block-diagram",draft:!1,unlisted:!1,editUrl:"https://github.com/cis3296f24/growe/edit/main/documentation/docs/requirements/system-block-diagram.md",tags:[],version:"current",lastUpdatedBy:"Khanh Nguyen",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"docsSidebar",previous:{title:"System Overview",permalink:"/growe/docs/requirements/system-overview"},next:{title:"General Requirements",permalink:"/growe/docs/requirements/general-requirements"}},i={},c=[{value:"Class Diagram",id:"class-diagram",level:2}];function m(e){const n={h1:"h1",h2:"h2",mermaid:"mermaid",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"system-block-diagram",children:"System Block Diagram"}),"\n",(0,t.jsx)(n.h2,{id:"class-diagram",children:"Class Diagram"}),"\n",(0,t.jsx)(n.mermaid,{value:"classDiagram\n  RootLayout *-- Index : composes\n  RootLayout o-- Header : aggregates\n  RootLayout o-- Footer : aggregates\n  RootLayout o-- UserProvider : aggregates\n  Index *-- Auth : composes\n  GroupLayout *-- Group : composes\n  HomeLayout *-- Garden : composes\n  LogLayout *-- Camera : composes\n  SettingsLayout *-- Settings : composes\n  Auth ..> HomeLayout : navigates\n  Footer ..> HomeLayout : navigates\n  Footer ..> LogLayout : navigates\n  Footer ..> GroupLayout : navigates\n  Garden ..> GroupLayout : navigates\n  Header ..> SettingsLayout : navigates\n  Group ..> Plant : navigates\n  UserProvider ..|> UserContextType : implements\n  Auth --\x3e useUser : uses\n  Camera --\x3e useUser : uses\n  Garden --\x3e useUser : uses\n  Group --\x3e useUser : uses\n  \n  \n  class RootLayout {\n    +usePathname<Pathname> pathname\n    +boolean isIndexPage\n  }\n  class Index\n  class GroupLayout\n  class HomeLayout\n  class LogLayout\n  class SettingsLayout\n  class Auth {\n    +useRouter<Router> router\n    +useState<Step> step\n    +useState<string> email\n    +useState<string> username\n    +useState<string> displayName\n    +useState<string> password\n    +useUser<User> user\n    +useState<boolean> loading\n    +useState<string> error\n    +useState<boolean> emailValid\n    +handleSignUp()\n    +handleStep(newStep)\n    +handleLogin()\n    +handleLogout()\n    +handleCheckUsername()\n    +isValidEmail(email) : boolean\n    +handleCheckEmail()\n    +handleLoginPassword()\n    +handleResetPassword()\n  }\n  class Camera {\n    +useState<CameraType> facing\n    +useCameraPermissions<CameraPermissions> permission\n    +useUser<User> user\n    +useRef<CameraView> cameraRef\n    +useState<string | null> photoUri\n    +useState<boolean> isPreviewVisible\n    +toggleCameraFacing()\n    +takePictureAndShowPreview()\n    +uploadPicture()\n    +retakePicture()\n    +createLogEntry(imageUrl)\n  }\n  class Footer {\n    +useRouter<Router> router\n    +useState<string> selected\n    +usePathname<Pathname> pathname\n    +handlePress(screen)\n  }\n  class Garden {\n    +useRouter<Router> router\n    +useUser<User> user\n    +useState<DocumentReference[]> groups\n    +useState<boolean> hasGroups\n  }\n  class Group {\n    +useState<Step> step\n    +useState<DocumentReference[]> groups\n    +useState<boolean> hasGroups\n    +useUser<User> user\n    +userState<string> groupName\n    +useState<string> codeInput\n    +useState<string> habit\n    +useState<string> error\n    +useState<DocumentReference[]> groupMembers\n    +useState<string> groupCode\n    +useState<string[]> groupMemberNames\n    +fetchGroups() string\n    +handleCreateGroup()\n    +handleJoinGroup()\n    +handleStep(step)\n    +handleFrequency(newFrequency)\n  }\n  class Header {\n    +useState<boolean> isEnabled\n    +boolean toggleSwitch\n  }\n  class Plant\n  class Settings\n  class UserProvider {\n    +useUser<User | null> user\n  }\n  class useUser {\n    +useContext(UserContext) context\n  }\n  class UserContextType {\n    +User user\n  }"})]})}function l(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(m,{...e})}):m(e)}},28453:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>u});var t=s(96540);const a={},r=t.createContext(a);function o(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function u(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);