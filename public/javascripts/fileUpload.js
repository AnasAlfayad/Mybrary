// Register the plugin
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
);
// console.log(FilePond);

FilePond.setOptions({
  stylePanelAspectRatio: 150 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150,
});

// ... FilePond initialisation code here
FilePond.parse(document.body);
