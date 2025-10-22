import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

const uploadthingConfig = {
  url: "http://localhost:8081/api/uploadthing",
};

export const UploadButton = generateUploadButton(uploadthingConfig);
export const UploadDropzone = generateUploadDropzone(uploadthingConfig);
export const { useUploadThing, uploadFiles } =
  generateReactHelpers(uploadthingConfig);
