# X-I-A API Tutorial - 01-04: Data manipulation (CRUD)
## Getting Started

Welcome to XIA API tutorial!

The goal of this tutorial is to quickly show you how to build a complex application by using X-I-A API framework. 
This framework is microservice based in order to get a fast learning curve for developers and AI.

## How to use this tutorial

Each tutorial is ended by a series number like 01-02-03. The longer the series is, the more advanced topic is discussed.
It will be better to finish basic tutorial before going through advanced ones. Each tutorial has example code. 
Installation instruction could be found at tutorial/install.md.

## Prerequisites

Already finish the reading of
* [Tutorial API 01](https://github.com/X-I-A/xia-tutorial-api-01)


## Start with example

Please clone and deploy the example code (see [installation guide](tutorial/install.md) for instruction).

Or just visiting the already deployed [online version](https://xia-tutorial-api-01-04-srspyyjtqa-ew.a.run.app/order)

### Modifications:

This version is nearly the same as [Tutorial API 01-01](https://github.com/X-I-A/xia-tutorial-api-01-01), 

## Data Operations
### Creating data

There are two API endpoints for creating data:
* collection level POST method: https://xia-tutorial-api-01-04-srspyyjtqa-ew.a.run.app/api/order
    * For creating massive data entries
* document level POST method: https://xia-tutorial-api-01-04-srspyyjtqa-ew.a.run.app/api/order/<key to the document>
    * For creating a specific document 

### Next Step: Making your data persistent

Data Model use by default RamEngine which keeps data in Memory. 
In order to make your data persistent, you will need to change data engine. 
X-I-A is capable of working with any database. Please follow the next tutorial:
* Tutorial 02: Database Engine Integration
* Tutorial 03: User Authentication
* Tutorial 04: Authorization Management
* Tutorial 05: Applying rate limits // Payment
* Tutorial 06: Making independent microservice work as a complex application 
* Tutorial 07: Examples of complex application
