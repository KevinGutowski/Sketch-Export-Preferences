import { UI } from 'sketch';
import sketch from 'sketch/dom';
import dialog from '@skpm/dialog';
import { writeFileSync } from '@skpm/fs';

export default function() {
    let exportPresets = MSPersistentAssetCollection.sharedGlobalAssets().exportPresets()
    let document = sketch.getSelectedDocument()
    if (exportPresets.length === 0) {
        UI.message('No export preferences.')
        return
    }

    let data = { "presets": [], "author": String(NSFullUserName())}
    exportPresets.forEach(preset => {
        console.log(preset)
        let p = {}
        p.class = String(preset.class())
        p.name = String(preset.name())
        p.shouldApplyAutomatically= preset.shouldApplyAutomatically()
        p.exportFormats = []
        preset.exportFormats().forEach(exportFormat => {
            let f = {}
            f.class = String(exportFormat.class())
            f.absoluteSize = exportFormat.absoluteSize()
            f.fileFormat = String(exportFormat.fileFormat())
            f.name = String(exportFormat.name())
            f.namingScheme = exportFormat.namingScheme()
            f.scale = exportFormat.scale()
            f.visibleScaleType = exportFormat.visibleScaleType()
            p.exportFormats.push(f)
        })
        data.presets.push(p)
    })

    console.log("before stringify", data)
    dialog.showSaveDialog(document,{
            filters: [{ name: 'JSON', extensions: [ 'json' ] }]
        }).then(
        result => {
            let filepath = result.filePath
            try {

                console.log("after stringify", JSON.stringify(data))
                writeFileSync(filepath, JSON.stringify(data))
                //data.writeToFile_atomically(filepath,true)
            } catch(e) {
                console.log("writefilesync didn't work")
                console.log(e)
            }
        }, error => {
            console.log(error)
        }
    )
}
