export function imageFromBuffer(data: Buffer): Promise<HTMLImageElement> {
  return new Promise((res) => {
    var blob = new Blob([data], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    var img = new Image();
    img.src = imageUrl;
    img.onload = (_) => {
      res(img);
    };
  });
}
