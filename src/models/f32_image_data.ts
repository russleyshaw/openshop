import { sortBy } from "lodash";
import { Point } from "../common/point";

export class F32ImageData {
    readonly width: number;
    readonly height: number;

    data: Float32Array;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.data = new Float32Array(this.width * this.height * 4);
    }

    static fromImageData(img: ImageData): F32ImageData {
        const f32Img = new F32ImageData(img.width, img.height);

        for (let i = 0; i < img.data.length; i++) {
            f32Img.data[i] = img.data[i] / 255;
        }

        return f32Img;
    }

    toImageData(): ImageData {
        const img = new ImageData(this.width, this.height);

        for (let i = 0; i < this.data.length; i++) {
            img.data[i] = Math.floor(this.data[i] * 255);
        }

        return img;
    }
}
