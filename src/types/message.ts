type TraqMessage = {
    userTraqId: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    stamps: [
        {
            stampId: string,
            stampUrl: string,
            count: number
        }
    ],
    citations: [
        {
            userTraqId: string,
            content: string,
            createdAt: string,
            updatedAt: string,
        }
    ],
}

export default TraqMessage;