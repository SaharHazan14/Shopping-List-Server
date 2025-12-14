import { Request, Response } from "express"
import { ListService } from "./list.service"
import { ListRepository } from "./list.repository"

const service = new ListService(new ListRepository)

export class ListController {
    
}