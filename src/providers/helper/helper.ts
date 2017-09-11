import {Injectable} from '@angular/core';

@Injectable()
export class HelperProvider {

    /**
     * Sorts an array of objects by a property of the object.
     *
     * @param objects Objects to sort.
     * @param property Property to sort by.
     * @param desc Whether sort should be performed in reversed order.
     * @returns {Array<any>} The sorted array.
     */
    public static sortByProperty(objects: Array<any>, property: string, desc: boolean = false): Array<any> {
        objects.sort((a: any, b: any): number => {
            let sort: number = 0;

            if(a[property] && b[property]) {
                if(a[property] < b[property]) {
                    sort = desc ? 1 : -1;
                } else if(a[property] > b[property]) {
                    sort = desc ? -1 : 1;
                }
            } else if(a[property] && !b[property]) {
                sort = desc ? -1 : 1;
            } else if(!a[property] && b[property]) {
                sort = desc ? 1 : -1;
            }

            return sort;
        });

        return objects;
    }

    /**
     * Checks whether an object or array has a property that may be nested deeply into the object.
     *
     * @param object any The object or array to check for properties.
     * @param properties Array<string> Array of string properties or a string. The properties are ordered and looped so each property represents a nesting level in the object or array.
     * @returns {boolean} Whether the object or array has the provided set of nested properties.
     */
    public static propertyExistsRecursive(object: object | Array<any>, properties: Array<string>): boolean {
        if(typeof object === 'object' && ( (Array.isArray(properties) && properties.length) > 0 || typeof properties === 'string' )) {
            properties = typeof properties === 'string' ? [properties] : properties;
            for(let i in properties) {
                // Check that current object is an object or array and that current property to check is a string or number
                if(typeof object === 'object' && ( typeof properties[i] === 'string' || typeof properties[i] === 'number' )) {
                    // If the current object is not undefined or null
                    if(object[properties[i]] != null) {
                        object = object[properties[i]];
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }

        return true;
    }

    /**
     * Detect whether user is running Internet Explorer.
     *
     * @returns {boolean} Whether user is running Internet Explorer.
     */
    public static detectInternetExplorer(): boolean {
        if(HelperProvider.propertyExistsRecursive(window, ['navigator', 'userAgent'])) {
            let ua: string = window.navigator.userAgent;

            let msie: number = ua.indexOf('MSIE ');
            if(msie > 0) {
                // IE 10 or older => return version number
                return true
            }

            let trident: number = ua.indexOf('Trident/');
            if(trident > 0) {
                // IE 11 => return version number
                return true;
            }
        }

        return false;
    }
}
