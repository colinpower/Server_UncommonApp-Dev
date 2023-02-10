export function getTimestamp() {

    const current_timestamp_milliseconds = new Date().getTime();
    const timestamp = Math.round(current_timestamp_milliseconds / 1000);

    return timestamp;
};

export function convertTimestampToShortDate(timestamp) {

    const date = new Date(timestamp * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${month} ${day}`;
}