// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

const getURL = (path: string) => 
{
    let url;

    if(process.env.NODE_ENV === "production") 
    {
        url = "https://api.kadenbilyeu.com";
    } 
    else if (process.env.NODE_ENV === "development")
    {
        url = "http://localhost:5000";
    } 
    
    return url + path;
}

const formatDate = (dateString: string) => 
{
    // Parse the input date string as UTC
    const utcDate = new Date(dateString);
    
    // Convert UTC to local time
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    
    // Get local date components
    const year = localDate.getFullYear();
    const month = localDate.toLocaleString('default', { month: 'short' });
    const day = localDate.getDate();
    let hours = localDate.getHours();
    const minutes = localDate.getMinutes().toString().padStart(2, '0');
    
    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Get timezone abbreviation
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeZoneAbbr = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short'
    }).formatToParts().find(part => part.type === 'timeZoneName')?.value || '';
    
    // Construct the formatted string
    const formattedDate = `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm} ${timeZoneAbbr}`;
    
    return formattedDate;
};

const isBikatr7URL = () => 
{
    const currentURL = window.location.href.toLowerCase();
    return currentURL.includes('bikatr7');
}
const createSlug = (title: string): string =>
{
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
}

const parseSlugOrId = (param: string): { isSlug: boolean; value: string } =>
{
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);
    const isSlug = !isUUID;
    return { isSlug, value: param };
}

const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const authOptions: RequestInit = {
        ...options,
        credentials: 'include',
    };

    let response = await fetch(url, authOptions);

    // If we get a 401, try to refresh the token and retry the request
    if (response.status === 401) {
        try {
            const refreshResponse = await fetch(getURL('/refresh'), {
                method: 'POST',
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                response = await fetch(url, authOptions);
            } else {
                // Token refresh failed, user needs to login again
                // Trigger logout by calling the logout function if available
                window.location.reload();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            window.location.reload();
        }
    }

    return response;
};

export {getURL, formatDate, isBikatr7URL, createSlug, parseSlugOrId, authenticatedFetch}