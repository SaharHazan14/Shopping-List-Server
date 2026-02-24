export interface CreateUserDTO {
    cognitoSub: string,
    email: string
}

export interface DBUserDTO {
    id: number,
    cognitoSub: string,
    email: string
}