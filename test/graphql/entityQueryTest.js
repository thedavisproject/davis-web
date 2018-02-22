const shared = require('davis-shared');
const {thread} = shared.fp;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.use(chaiAsPromised);

const {expect} = chai;

const Task = require('data.task');
const when = require('when');

const sinon = require('sinon');

const model = require('davis-model');
const {folder, dataSet, variable, attribute} = model;

const entityQueryFac = require('../../src/graphql/entityQuery.js');
const graphql = require('./graphQLInit');

const { newRegistry, registerTypeFac } =
  require('../../src/graphql/typeRegistry.js');

const stubGQLTypeFac = name => registryIgnored =>
  new graphql.GraphQLObjectType({
    name: name,
    fields: {}
  });

describe('Entity Create', function(){

  const registry = thread(newRegistry(),
    registerTypeFac(stubGQLTypeFac('FolderCreate')),
    registerTypeFac(stubGQLTypeFac('Folder')),
    registerTypeFac(stubGQLTypeFac('DataSetCreate')),
    registerTypeFac(stubGQLTypeFac('DataSet')),
    registerTypeFac(stubGQLTypeFac('VariableCreate')),
    registerTypeFac(stubGQLTypeFac('Variable')),
    registerTypeFac(stubGQLTypeFac('AttributeCreate')),
    registerTypeFac(stubGQLTypeFac('Attribute')));

  describe('Folder', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const folderCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.folders.resolve;

      const result = folderCreateResolve(null, { folders: [{name: 'hello', foo: 'bar'}] });

      return when.all([
        // Results from the create method should be converted to promise and returned as is
        expect(result).to.eventually.equal('foo'),
        expect(entityRepoStub.create.args[0][0]).to.deep.equal([
          folder.new(null, 'hello', {foo: 'bar'})
        ])
      ]);
    });

    it('should throw an error if id is supplied', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const folderCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.folders.resolve;

      expect(() => folderCreateResolve(null, { folders: [{ id: 5}] }))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });
  });

  describe('Data Set', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const dataSetsCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.dataSets.resolve;

      const result = dataSetsCreateResolve(null, { dataSets: [{name: 'hello', foo: 'bar'}] });

      return when.all([
        // Results from the create method should be converted to promise and returned as is
        expect(result).to.eventually.equal('foo'),
        expect(entityRepoStub.create.args[0][0]).to.deep.equal([
          dataSet.new(null, 'hello', {foo: 'bar'})
        ])
      ]);
    });

    it('should throw an error if id is supplied', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const dataSetCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.dataSets.resolve;

      expect(() => dataSetCreateResolve(null, { dataSets: [{ id: 5}] }))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });

  });

  describe('Variable', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const variablesCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.variables.resolve;

      const result = variablesCreateResolve(null, { variables: [{
        name: 'hello',
        foo: 'bar',
        type: variable.types.categorical
      }] });

      return when.all([
        // Results from the create method should be converted to promise and returned as is
        expect(result).to.eventually.equal('foo'),
        expect(entityRepoStub.create.args[0][0]).to.deep.equal([
          variable.newCategorical(null, 'hello', {foo: 'bar'})
        ])
      ]);
    });

    it('should throw an error if id is supplied', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const variableCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.variables.resolve;

      expect(() => variableCreateResolve(null, { variables: [{ id: 5}] }))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });

  });

  describe('Attribute', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const attributesCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.attributes.resolve;

      const result = attributesCreateResolve(null, { attributes: [{name: 'hello', foo: 'bar', variable: 5}] });

      return when.all([
        // Results from the create method should be converted to promise and returned as is
        expect(result).to.eventually.equal('foo'),
        expect(entityRepoStub.create.args[0][0]).to.deep.equal([
          attribute.new(null, 'hello', 5, {foo: 'bar'})
        ])
      ]);
    });

    it('should throw an error if id is supplied', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityQuery = entityQueryFac({
        entityRepository: entityRepoStub,
        graphql
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const attributeCreateResolve =
        entityQuery.gqlEntityCreate(registry)._typeConfig.fields.attributes.resolve;

      expect(() => attributeCreateResolve(null, { attributes: [{ id: 5}] }))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });
  });
});
