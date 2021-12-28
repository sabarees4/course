'use strict';
module.exports.slugify = ( text ) => {
    return text.toString().toLowerCase()
        .replace( /\s+/g, '-' ) // Replace spaces with -
        .replace( /[^\w\-\.]+/g, '' ) // Remove all non-word chars
        .replace( /\-\-+/g, '-' ) // Replace multiple - with single -
        .replace( /^-+/, '' ) // Trim - from start of text
        .replace( /-+$/, '' ); // Trim - from end of text
};

module.exports.GetDateTimeInTimeZone = (vTimeZone, vLanguageCode) => {
    let time_Zone = '', region_Languagecode = '';
    if (vTimeZone == '' || undefined)
      time_Zone = "Asia/Kolkata"
    else
      time_Zone = vTimeZone;
    if (vLanguageCode == '' || undefined)
      region_Languagecode = "en-GB";
    else
      region_Languagecode = vLanguageCode;
    // return new Date().toISOString().slice(0, 10) + " " +
    //   new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Calcutta' });
    var indiaTime = new Date().toLocaleString(region_Languagecode, { timeZone: time_Zone });
    var vCDate = new Date(indiaTime);
    console.log('India time: ' + vCDate)
    return vCDate;
  }