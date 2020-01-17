import { UI } from 'sketch';
import sketch from 'sketch/dom';
import dialog from '@skpm/dialog';
import { readFileSync } from '@skpm/fs';

export default function() {
    let document = sketch.getSelectedDocument()
    dialog.showOpenDialog(document, {
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    }).then(
        result => {
            let filepath = result.filePaths[0]
            let rawdata = readFileSync(filepath)
            if (!rawdata) {
                UI.message('⚠️ File could not be read')
            }

            let json = JSON.parse(rawdata)
            if (!json) {
                UI.message('⚠️ JSON could not be parsed')
            }

            let exportPresets = jsonToExportPref(json)
            if (!exportPresets) {
                UI.message('⚠️ Invalid JSON structure')
                return
            }

            let persistentAssetCollection = MSPersistentAssetCollection.sharedGlobalAssets()
            let selectionIndex = persistentAssetCollection.exportPresets().count()
            persistentAssetCollection.addExportPresets(exportPresets)
            UI.message('✅ Successfully added Export Presets')

            // Open preference window
            let prefController = MSPreferencesController.sharedController()
            let preferencePane
            try {
                // Check to see if the preference views need to be updated
                preferencePane = prefController.preferencePanes().objectForKey('exportPresets')
                preferencePane.refreshExportFormats()
                preferencePane.refreshExportPresets()
            } catch {
              // don't need to refresh views it since its not cached
            }
            // Open preferences window to the 'exportPresets' tab
            prefController.switchToPaneWithIdentifier('exportPresets')
            try {
                // double check that the ExportPresetsPreferencePane is still in cache
                preferencePane = prefController.preferencePanes().objectForKey('exportPresets')
                preferencePane.selectPresetAtIndex(selectionIndex)
            } catch {}
        }, error => {
            // Most likely the user canceled the save
        }
    )
}

function jsonToExportPref(json) {
    let exportPresets = NSMutableArray.array()
    let presets = json.presets
    if (!presets) {
        return null
    }
    presets.forEach(preset => {
        let sketchPreset = MSExportPreset.alloc().init()
        sketchPreset.name = preset.name
        sketchPreset.shouldApplyAutomatically = preset.shouldApplyAutomatically

        let exportFormatContainer = NSMutableArray.array()
        preset.exportFormats.forEach(exportFormat => {
            let sketchExportFormat = MSExportFormat.alloc().init()
            sketchExportFormat.absoluteSize = exportFormat.absoluteSize
            sketchExportFormat.fileFormat = exportFormat.fileFormat
            sketchExportFormat.name = exportFormat.name
            sketchExportFormat.scale = exportFormat.scale
            sketchExportFormat.visibleScaleType = exportFormat.visibleScaleType

            exportFormatContainer.addObject(sketchExportFormat)
        })
        sketchPreset.exportFormats = exportFormatContainer

        exportPresets.addObject(sketchPreset)
    })

    return exportPresets
}
