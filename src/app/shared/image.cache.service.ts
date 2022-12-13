
import { Injectable } from '@angular/core';

interface CachedImage {
    url: string;
    blob: Blob;
}


@Injectable({
    providedIn: 'root'
})
export class ImageCacheService {

    private cachedImages: { [url: string]: Blob } = {}

    constructor() { }
    
    getCachedImage(url: string): Blob {
        return this.cachedImages[url]
    }

    setCachedImage(url: string, blob: Blob) {
        this.cachedImages[url] = blob
    }
    
}