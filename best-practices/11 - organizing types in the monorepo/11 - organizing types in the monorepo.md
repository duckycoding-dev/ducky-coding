## Type definition organization and uses

Working with many types might raise the complexity of the project.\
In order to help with these we will organize how the data flows between the different packages and layers of the architecture: we will be using **_DTOs_ (data transfer objects)**.

Other than DTOs we will have three other main "type of types": **_Entities_**, **_Database schemas_** and **_Content schemas_**.\
Here's a breakdown of where they will be stored

```js
|__packages/
    |__astro-app
        |__src/
            |__content/
                |__config.ts /* markdown files' frontmatter schemas, deriving/modifying entity type from "types" package */
    |__db/
        |__models/ /* database table schemas and mapper functions between schemas and DTOs */
    |__types
        |__mappers/ /* here we define mapping functions for DTOs-Entities */
        |__DTOs/ /* here we defined DTOs schemas from which we infer their respective types, and mapping functions mapToDTO, mapFromDTO */
        |__entities/ /* main domain types */
            |__composite-entities/ /* types that define combination of other types: e.g., UserWithProfilePicture */
```

### Responsibilities of different kind of Types

- Entities: these are the types that define the domain; they are the basic foundation of other types and are the ones that will be used throughout the project the most.\
  Entities, as the name suggest, reflect how the "domain entities" are represented: there can also be the so called "**Composite entities** that represent combinations of other entities (e.g.: if we have a User entity and a Image entity, we could have a composite entity called UserWithProfilePicture)

- Database schemas: deriving from entities, schemas define the structure of the database tables and are used at the _repository_ layer, in which direct communication with the database, via queries, happens.

- Content schemas: also deriving from entities, they define the structure of the markdown files' frontmatter (e.g. for blog posts): they can also influence database schemas.

- DTOs: these objects are what is used to communicate between the different layers; the service layer accepts and return these kind of objects that will then be mapped to either entities or database schemas (they could also be used in API endpoints in the future if needed).

## Mapping from and to DTOs

We also need to define functions that can map between Entities-DTOs and viceversa.\
These functions will be defined in they _types_ shared package.\
There will also be needed functions to map DTOs-Database Schemas (and viceversa): these will be defined inside the database package, since Database schemas will only be used at the service and repository layers of this package.

## How to define types

Since we will always need to validate DTOs objects's content we will defined DTOs by first creating Zod schemas from which we will infer the final DTO type.

Database schemas are instead defined using Drizzle ORM: TODO // check if drizzle-zod can be used to also have Zod schemas in place for validation

For entity types we can use plain Typescript types/interfaces for now

## Validating DTOs

In order to mantaing data integrity and correctness, it will be mandatory to validate data flowing as DTO objects, both on the backend and on the frontend on the client side.\
On the backend the validation will always happen at the service layer and will always happen at the API endpoint handlers layer (controllers) when and if they will be introduced in the project; the double validation will be an extra step for security: keep in mind that the database service layer could be called directly, thus needing to validate content there as well, not only at the API endpoint handler.

The object can be validated on the client side before sending requests to the backend to provide users instant feedback and avoid unnecessary backend calls
