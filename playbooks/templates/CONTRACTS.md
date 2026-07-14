<!-- Written in Wave 0. FROZEN during the wave — workers consume, never negotiate. A signature alone is not a contract: every interface below must pin (a) the exact shape, (b) one populated example value, and (c) the failure shape — what an error actually returns. Two workers who can imagine two different shapes for the same interface will build two different shapes. -->
# CONTRACTS — Epic <NN>

## Types
<shared data types every story's code must import rather than redefine — exact fields and types, plus one populated example value per type>

## API endpoints
<method, path, request shape, response shape, for every endpoint a story will call or implement — each with one populated example request/response AND the failure shape (status code + error body)>

## Data schema
<tables/collections, fields, types, relationships — and each store's invariants (uniqueness, ordering, case rules), each one stating explicitly whether readers may assume it holds or must tolerate violations of it>

## Interfaces/signatures
<function and module signatures stories are expected to implement or call — each with one populated example call + return value, and what it returns or throws on failure>

## Conventions
<naming, error handling, and structural conventions that keep parallel stories consistent>
