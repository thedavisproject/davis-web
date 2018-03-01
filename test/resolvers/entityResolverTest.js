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

const entityResolverFac = require('../../src/resolvers/entityResolver.js');

const resolver_entityLoaderFactory = { entityLoaderFactory: sinon.stub() };
resolver_entityLoaderFactory.entityLoaderFactory.returns([]);

describe('Entity Create', function(){

  describe('Folder', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const result = entityResolver.resolveFolderCreate([{name: 'hello', foo: 'bar'}]);

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
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      expect(() => entityResolver.resolveFolderCreate([{ id: 5}]))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });
  });

  describe('Data Set', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const result = entityResolver.resolveDataSetCreate([{name: 'hello', foo: 'bar'}]);

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
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      expect(() => entityResolver.resolveDataSetCreate([{ id: 5}]))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });

  });

  describe('Variable', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const result = entityResolver.resolveVariableCreate([{
        name: 'hello',
        foo: 'bar',
        type: variable.types.categorical
      }]);

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
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      expect(() => entityResolver.resolveVariableCreate([{ id: 5}]))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });

  });

  describe('Attribute', function(){

    it('should use entity constructor', function(){

      const entityRepoStub = { create: sinon.stub() };
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      const result = entityResolver.resolveAttributeCreate([{name: 'hello', foo: 'bar', variable: 5}]);

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
      const entityResolver = entityResolverFac({
        entityRepository: entityRepoStub,
        resolver_entityLoaderFactory
      });

      entityRepoStub.create.returns(Task.of('foo'));

      expect(() => entityResolver.resolveAttributeCreate([{ id: 5}]))
        .to.throw(/Entity ID must not be supplied for CREATE action/);
    });
  });
});
