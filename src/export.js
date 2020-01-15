import { UI } from 'sketch';
import sketch from 'sketch/dom';
import dialog from '@skpm/dialog';
import { writeFileSync } from '@skpm/fs';
import { toSJSON } from '@skpm/sketchapp-json-plugin'

export default function() {
    // let exportPresets = MSPersistentAssetCollection.sharedGlobalAssets().exportPresets()

    // if (exportPresets.length === 0) {
    //     UI.message('No export preferences.')
    // }

    // let data = []
    // exportPresets.forEach(preset => {
    //     data.push(toSJSON(preset))
    // })
    let data = "Hello there"

    dialog.showSaveDialog(
        {
            filters: [{ name: 'Text File', extensions: [ 'txt', 'text' ] }]
        },
        (filePath) => {
            console.log('hiya!')
            writeFileSync(filePath, data);
            UI.message('Text saved to... "' + filePath + '".');
        }
    );
}
