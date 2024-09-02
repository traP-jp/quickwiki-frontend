type TraqMessage = {
    userTraqId: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    stamps: [
        {
            stampId: string,
            count: number
        }
    ]
}

export default TraqMessage;