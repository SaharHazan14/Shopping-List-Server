import { Role } from './generated/prisma/enums'
import { prisma } from './lib/prisma'
import { ListRepository } from './src/modules/list/list.repository'

const listRepository = new ListRepository()

async function main() {
  // create new list
  /*
  const list = await listRepository.create("Example List", null, 1)
  console.log(list)
  */
  
  // Find list by id
  /*
  const listFoundById = await listRepository.findById(1)
  console.log(listFoundById)
  */

  // Find list by user
  /*
  const listFoundByUser1 = await listRepository.findByUser(1)
  console.log(listFoundByUser1)

  const listFoundByUser2 = await listRepository.findByUser(2)
  console.log(listFoundByUser2)
  */

  // Find list by creator
  /*
  const listFoundByCreator1 = await listRepository.findByCreator(1)
  console.log(listFoundByCreator1)

  const listFoundByCreator2 = await listRepository.findByCreator(2)
  console.log(listFoundByCreator2)
  */

  // Find user role
  const role = await listRepository.findUserRole(1, 2)
  console.log(role)

  /*listRepository.delete(1)*/
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })