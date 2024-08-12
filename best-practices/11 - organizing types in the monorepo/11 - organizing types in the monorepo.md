## Type definition organization and uses

Working with many types might raise the complexity of the project.\
In order to help with these we will organize how the data flows between the different packages and layers of the architecture: we will be using **_DTOs_ (data transfer objects)** as the main types used throught the entire project.

Other than DTOs we will have two other main "type of types": **_Entities_** and **_Database schemas_**.
Here's a breakdown of where they will be stored

```js
|__packages/
    |__astro-app/
        |__src/
            |__content/
                |__config.ts /* markdown files' frontmatter schemas, using schemas defined in "types" package */
    |__db/
        |__models/ /* database table schemas and mapper functions between schemas and DTOs */
        |__mappers/ /* here we define mapping functions for for repository functions output and DTOs */
    |__types/
        |__DTOs/ /* here we defined DTOs schemas from which we infer their respective types */
        |__entities/ /* domain types that can be used in multiple pacakges; eg. ContentStatus; here Zod schemas are defined and type are inferred from those schemas */
```

### Responsibilities of different kind of Types

- Entities: these are types that are used by others, representing domain related things.

- Database schemas: schemas define the structure of the database tables and are used at the _repository_ layer, in which direct communication with the database, via queries, happens.

- Content schemas: deriving from **basic DTOs**, they define the structure of the markdown files' frontmatter (e.g. for blog posts).

- DTOs: these objects are what is used to communicate between the different layers; the service layer accepts and return these kind of objects that will then be mapped to database schemas (they could also be used in API endpoints in the future if needed): there are **basic DTOs** that are closely related to the database schemas, and there are **custom DTOs** that are edits of basic DTOS (by combining them together, changing the fields optionality, etc).

## Mapping from and to DTOs

We also need to define functions that can map between dbSchemas-DTOs and viceversa.\
These functions will be defined in the _mappers_ directory in the db package, as these mappers will only be used at the repository layer of the db package.\
Our service layer will always expect to receive an object DTO from the repository layer: this allows us to be more flexible in the future, by letting us be able to change the repository layer at any time without having to change the service layer as well.

## How to define types

Since we will always need to validate DTOs objects's content we will defined DTOs by first creating Zod schemas from which we will infer the final DTO type.

Database schemas are instead defined using Drizzle ORMç the idea is to use the `drizzle-zod` library to infer Zod schemas from the table definition to then create types and always up to date Zod schemas: as of right now `drizzle-zod` seems to not work, so we need to manually define Zod schemas together with table schemas.\
Once `drizzle-zod` will work, we will then delete the manually created Zod schemas and replace them with inferred ones.

For entity types we will also use Zod schema, but for some special cases we can use plain Typescript types/interfaces for now

## Validating DTOs

In order to maintaing data integrity and correctness, it will be mandatory to validate data flowing as DTO objects, both on the backend and on the frontend on the client side.\
On the backend the validation will always happen at the service layer and will always happen at the API endpoint handlers layer (controllers) when and if they will be introduced in the project; the double validation will be an extra step for security: keep in mind that the database service layer could be called directly, thus needing to validate content there as well, not only at the API endpoint handler.

The object can be validated on the client side before sending requests to the backend to provide users instant feedback and avoid unnecessary backend calls

## Inversion of Control (IoC) with Dependency Injection (DI)

As of right now, having a very simple project, we don't really need much of the complexity we are creating by structuring the architecture: we could also be using IoC with DI in order to remove the service layer dependencies from the repository layer.\
We should be passing the repository to the service layer, instead of importing it directly, so that we can later swap it out with ease (say for example, if we need to move our repository logic to Prisma instead of Drizzle): this will be more meaninful when/if we will have a controller layer for the API endpoints from which we will be calling the service layer by passing the repository layer we want to use as a dependency.\
We could have a `v1/getAllUsers/` endpoint that uses the Drizzle repository and at the same time have a `v2/getAllUsers/` that uses the Prisma repository:

```ts
// users.controller.ts
export function getAllUsers(repository: IRepository): UserDTO[]{
    ...
    const usersFromServiceLayer: UserDTO[] = service.getAllUsers(repository);
    return ...;
}

// users.handlers.ts (pseudo-code)
v1getAllUsers = getAllUsers(drizzleRepository);
v2getAllUsers = getAllUsers(prismaRepository);
```
