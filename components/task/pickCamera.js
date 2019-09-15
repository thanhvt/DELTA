var ImagePicker = require('react-native-image-picker');

var options = {
  title: 'Chọn ảnh tải lên',
  // customButtons: [
  //   { name: 'fb', title: 'Chọn ảnh từ Facebook' },
  // ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

let pickCamera = (showImageCallback) => {
  ImagePicker.launchCamera(options, (response) => {
    //console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    }
    else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    }
    else if (response.customButton) {
      console.log('User tapped custom button: ', response.customButton);
    }
    else {
      //let source = { uri: response.uri };

      // You can also display the image using data:
      // let source = { uri: 'data:image/jpeg;base64,' + response.data };

      showImageCallback(response);
    }
  });

  // Launch Camera:
  // ImagePicker.launchCamera(options, (response)  => {
  //     // Same code as in above section!
  // });

  //Open Image Library:
  // ImagePicker.launchImageLibrary(options, (response)  => {
  //     // Same code as in above section!
  // });
}

export default pickCamera;