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

    dialog.showSaveDialog(document,{
            filters: [{ name: 'JSON', extensions: [ 'json' ] }]
        }).then(
        result => {
            let filepath = result.filePath
            try {
                writeFileSync(filepath, JSON.stringify(data))
                UI.message(`✅ Export preferences saved to ${filepath}`)
            } catch(e) {
                UI.message("⚠️ Export preferences failed to be saved. Please try again.")
                console.log("writefilesync didn't work")
                console.error(e)
            }
        }, error => {
            // Most likely the user canceled the save
        }
    )
}
