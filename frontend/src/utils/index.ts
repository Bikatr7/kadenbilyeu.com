/*
Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
Use of this source code is governed by an GNU Affero General Public License v3.0
license that can be found in the LICENSE file.
*/

const getURL = (path: string) => 
    {
        let url;
    
        if(process.env.NODE_ENV === "production") 
        {
            url = "https://api.kadenbilyeu.com";
        } 
        else if (process.env.NODE_ENV === "development") 
        {
            url = "http://api.localhost:5000";
        } 
        
        return url + path;
    }
    
    export {getURL};