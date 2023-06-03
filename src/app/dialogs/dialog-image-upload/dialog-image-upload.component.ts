import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dimensions, ImageCroppedEvent, ImageTransform } from './interfaces/index';
import { base64ToFile, urlToFile } from './utils/blob.utils';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-dialog-image-upload',
  templateUrl: './dialog-image-upload.component.html',
  styleUrls: ['./dialog-image-upload.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogImageUploadComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  roundCropper = false;

  constructor(
    public dialogRef: MatDialogRef<DialogImageUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.roundCropper = data.roundCropper;
    this.croppedImage = data.croppedImage;
  }

  captureImage() {
    let options = {
      quality: 90,
      allowEditing: true,
      source: CameraSource.Prompt,
      resultType: CameraResultType.Uri
    }
    Camera.getPhoto(options).then(async imageData => {
      this.containWithinAspectRatio = false;
      const imageFile = await urlToFile(imageData.webPath, 'image.jpg', 'image/jpeg');
      this.fileChangeEvent({ target: { files: [imageFile] } });
    }, (err) => {
      console.log(err);
    });
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
    setTimeout(() => {
      this.containWithinAspectRatio = true;
    }, 100);
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }


  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomChange(value: number) {
    (value);
    this.scale = value;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  cancel() {
    this.dialogRef.close(null);
  }
  submit() {
    this.dialogRef.close(this.croppedImage);
  }
}
