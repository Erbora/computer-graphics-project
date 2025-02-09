# 3D Interactive Neighborhood

## Project Overview
The **3D Interactive Neighborhood** is a dynamic visualization project that presents a virtual cityscape, featuring animated elements and interactive controls. This project, developed using **Three.js**, offers users an immersive experience where they can explore a growing city with moving cars, falling snow, and detailed architectural models.

### Features:
- **Realistic Environment**: The scene includes houses, trees, roads, a football field, and even a lunapark.
- **Interactive Elements**: Users can navigate the environment with **OrbitControls**, modifying the scene's lighting and toggling visibility settings using **dat.GUI**.
- **Animated Objects**: A moving car drives along the road, and a walking pedestrian adds realism to the neighborhood.
- **Dynamic Weather**: A snowfall effect enhances the immersive experience.
- **HDR Environment Mapping**: The skybox uses HDR textures to provide a natural ambiance.

## Getting Started
These instructions will help you set up and run the project on your local machine.

### Prerequisites
Ensure you have the latest version of **Node.js** installed, as it includes **npm**, which is required for installing project dependencies.

### Installation
Follow these steps to set up the project locally:

1. **Open Terminal / PowerShell** as Administrator.
2. **Navigate to the Project Directory:**
   ```sh
   cd 3D-Neighborhood
   
3. **Install Required Packages:**
   ```sh
   npm install three
   npm install vite
   npm install dat.gui

4. **Running the Project**
Once the dependencies are installed, start the development server using Vite:
```sh
npx vite
```
After running the command, a local server URL will be displayed. Copy and paste this URL into your web browser to interact with the 3D Interactive Neighborhood.
### Built With

- Three.js – A powerful JavaScript library for creating and displaying 3D graphics in the browser.

- Vite – A modern build tool that provides fast and optimized frontend development.

- dat.GUI – A lightweight graphical interface for adjusting scene variables dynamically.
