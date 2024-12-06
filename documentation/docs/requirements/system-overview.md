---
sidebar_position: 1
---

# System Overview

## This UML diagram represents the structure of a software application, showcasing classes, their attributes, methods, and relationships. Here's a concise overview:

## Core Structure:

The RootLayout serves as the main container, aggregating shared components like Header, Footer, and UserProvider, and composing page layouts like Index.

## Layouts and Pages:

Different layouts (HomeLayout, LogLayout, GroupLayout, etc.) organize specific pages of the app (Garden, Camera, Group, etc.).

## Navigation:

Components like Auth, Footer, Garden, and Header navigate between different pages, managing the flow of the application.

## Functionality:

Auth handles user authentication and account-related actions (e.g., sign-up, login).
Camera manages camera interactions (e.g., capturing and uploading photos).
Group and Garden represent group management and collaborative features.

## Context Management:

UserProvider and useUser manage and provide access to the global user state.

## Relationships:

Aggregation and Composition organize components hierarchically.
Navigation and Usage relationships show interactions and dependencies.


## This diagram outlines a modular application with clear separation of concerns, emphasizing navigation, context management, and functionality.