const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { spawn } = require('child_process');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');


process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';                    //Darwin on MAC, WIn32 on Windows

//respond to ipcRenderer resize
ipcMain.on('image:poem', (e, options) => {
    dest = path.join(os.homedir(), 'lyricallens');   
    poemImage(options);
});

ipcMain.on('image:story', (e,options) =>{
    dest = path.join(os.homedir(), 'lyricallens');
    storyImage(options);
});

ipcMain.on('OCR:image', (e, options) =>{
    dest = path.join(os.homedir(), 'lyricallens');
    OCRImage(options);
});

//resize the image
async function poemImage( imgPath ) {
    try {

        //call pyProcess
        // Invoke the image_to_keywords.py file with the selected image path
        const pyProcess = spawn('python', [path.join(__dirname, 'imageTOpoem.py'), imgPath]);

        // Initialize a variable to store the predictions data
        let predictionsData = '';

        // Listen for stdout data from the Python process
        pyProcess.stdout.on('data', (data) => {
            const dataString = data.toString('utf8');
            console.log('Received data from Python process:', dataString);

            // Append the data to the predictionsData variable
            predictionsData += dataString;

            // Check if the data contains the end of predictions indicator
            if (dataString.includes('Top 5 Predictions:')) {
                console.log('Sending predictions data to renderer:', predictionsData);
                mainWindow.webContents.send('image:done', predictionsData);

                // Clear the predictionsData variable for the next set of predictions
                predictionsData = '';
            }
        });
        
        // Listen for stderr data from the Python process
        pyProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        // Handle Python process exit
        pyProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });

        //open the dest folder
        //shell.openPath(dest);
    } catch(error){
        console.log(error);
    }
}

async function storyImage( imgPath ) {
    try {

        //call pyProcess
        // Invoke the image_to_keywords.py file with the selected image path
        const pyProcess = spawn('python', [path.join(__dirname, 'imageTOstory.py'), imgPath]);

        // Initialize a variable to store the predictions data
        let predictionsData = '';

        // Listen for stdout data from the Python process
        pyProcess.stdout.on('data', (data) => {
            const dataString = data.toString('utf8');
            console.log('Received data from Python process:', dataString);

            // Append the data to the predictionsData variable
            predictionsData += dataString;

            // Check if the data contains the end of predictions indicator
            if (dataString.includes('Top 5 Predictions:')) {
                console.log('Sending predictions data to renderer:', predictionsData);
                mainWindow.webContents.send('image:done', predictionsData);

                // Clear the predictionsData variable for the next set of predictions
                predictionsData = '';
            }
        });
        
        // Listen for stderr data from the Python process
        pyProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        // Handle Python process exit
        pyProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });

        //open the dest folder
        //shell.openPath(dest);
    } catch(error){
        console.log(error);
    }
}

async function OCRImage( imgPath ) {
    try {

        //call pyProcess
        // Invoke the image_to_keywords.py file with the selected image path
        const pyProcess = spawn('python', [path.join(__dirname, 'huggingface.py'), imgPath]);

        // Initialize a variable to store the predictions data
        let predictionsData = '';

        // Listen for stdout data from the Python process
        pyProcess.stdout.on('data', (data) => {
            const dataString = data.toString('utf8');
            console.log('Received data from Python process:', dataString);

            // Append the data to the predictionsData variable
            predictionsData += dataString;

            // Check if the data contains the end of predictions indicator
            if (dataString.includes('Predicted Emotion:')) {
                console.log('Sending predictions data to renderer:', predictionsData);
                mainWindow.webContents.send('image:done', predictionsData);

                // Clear the predictionsData variable for the next set of predictions
                predictionsData = '';
            }
        });
        
        // Listen for stderr data from the Python process
        pyProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        // Handle Python process exit
        pyProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });

        //open the dest folder
        //shell.openPath(dest);
    } catch(error){
        console.log(error);
    }
}

let pythonProcess;

ipcMain.on('python-script', () => {

    pythonProcess = spawn('python', [path.join(__dirname, 'virtualMouse.py')]);

    process.on('SIGINT', () => {
        if(pythonProcess) {
            pythonProcess.kill();
        }
        process.exit();
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        // Handle output from the Python script
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        // Handle errors from the Python script
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        // Handle process exit
    });
});


let mainWindow;

//Create the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Lyrical Lens',
        width: isDev ? 1000 : 3000,
        height:800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    // Open dev tools if in dev env
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './Renderer/index.html'));
}

//Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Lyrical Lens',
        width: 300,
        height: 300,
    });

    aboutWindow.loadFile(path.join(__dirname, './Renderer/about.html'));
}

//App is ready
app.whenReady().then(() => {
    createMainWindow();

//Implement menu
const mainMenu = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(mainMenu);

//remove main window from memory on close
mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow();
        }
      });
});

//Menu Template
const menu = [
    ...(isMac 
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
          ] 
        : []),
    {
        role:'fileMenu',
    },
    ...(!isMac 
        ? [
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
          ] 
        : []),
];


app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
})





//Incase of emergency Break Glass...(AKA comments)
/*
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';                    //Darwin on MAC, WIn32 on Windows

let mainWindow;

//Create the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Lyrical Lens',
        width: isDev ? 1000 : 1500,
        height:700,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    // Open dev tools if in dev env
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './Renderer/index.html'));
}

//Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Lyrical Lens',
        width: 300,
        height: 300,
    });

    aboutWindow.loadFile(path.join(__dirname, './Renderer/about.html'));
}

//App is ready
app.whenReady().then(() => {
    createMainWindow();

//Implement menu
const mainMenu = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(mainMenu);

//remove main window from memory on close
mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow();
        }
      });
});

//Menu Template
const menu = [
    ...(isMac 
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
          ] 
        : []),
    {
        role:'fileMenu',
    },
    ...(!isMac 
        ? [
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
          ] 
        : []),
];

//respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'lyricallens');
    resizeImage(options);
});

//resize the image
async function resizeImage({ imgPath, width, height, dest }) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        });

        //create filename
        const filename = path.basename(imgPath);

        //create destination flder if doesnt exist
        if(!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        //writefile to dest
        fs.writeFileSync(path.join(dest, filename), newPath);

        //send success to render
        mainWindow.webContents.send('image:done');

        //open the dest folder
        shell.openPath(dest);
    } catch(error){
        console.log(error);
    }
}

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })

*/