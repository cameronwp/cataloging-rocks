const {remote} = require('electron');
const {Menu, MenuItem} = remote;

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        role: 'save'
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        role: 'open'
      },
      {
        label: 'Refresh',
        accelerator: 'CmdOrCtrl+R',
        role: 'refresh'
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
