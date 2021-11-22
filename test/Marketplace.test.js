const { assert } = require('chai')

const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace

    before(async () => {
        marketplace = await Marketplace.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async () => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has the correct admin address', async () => {
            const admin = await marketplace.admin()
            assert.equal(admin, deployer)
        })
    })

    describe('allProperty', async() => {
        let result, propertyCount

        before(async () => {
            result = await marketplace.addProperty('5-Rm HDB', 'yishun', 'very nice', web3.utils.toWei('0.5', 'Ether'), 'test.com', { from: seller })
            propertyCount = await marketplace.totalPropertyCounter()
        })

        it('adds property', async () => {
            assert.equal(propertyCount, 1)
            const event = result.logs[0].args
            assert.equal(event._propID.toNumber(), propertyCount.toNumber(), 'propID is correct')
            assert.equal(event._propTitle, '5-Rm HDB', 'title is correct')
            assert.equal(event._propAddress, 'yishun', 'address is correct')
            assert.equal(event._propDescription, 'very nice', 'description is correct')
            assert.equal(event._propValue, '500000000000000000', 'value is correct')
            assert.equal(event._propOwner, seller, 'owner is correct')
            assert.equal(event._pendingSale, true, 'status is correct')
            assert.equal(event._imgURL, 'test.com', 'image url is correct')

            //test for failure
            await marketplace.addProperty('4-Rm HDB', 'yishun', 'very big', '600000000000000000', 'test2.com', seller, { from: seller }).should.be.rejected;
            await marketplace.addProperty('5-Rm HDB', '', 'very nice', web3.utils.toWei('0.5', 'Ether'), 'test.com', seller, { from: deployer }).should.be.rejected;
            await marketplace.addProperty('5-Rm HDB', 'yishun', 'very nice', 0, 'test.com', seller, { from: deployer }).should.be.rejected;
        })

        it('lists property', async () => {
            const property = await marketplace.allProperty(propertyCount)
            assert.equal(property.propID.toNumber(), propertyCount.toNumber(), 'propID is correct')
            assert.equal(property.propTitle, '5-Rm HDB', 'title is correct')
            assert.equal(property.propAddress, 'yishun', 'address is correct')
            assert.equal(property.propDescription, 'very nice', 'description is correct')
            assert.equal(property.propValue, '500000000000000000', 'value is correct')
            assert.equal(property.propOwner, seller, 'owner is correct')
            assert.equal(property.pendingSale, true, 'status is correct')
            assert.equal(property.imgURL, 'test.com', 'img url is correct')
        })

        it('makes offers', async () => {
            const result = await marketplace.makeOffer(propertyCount, web3.utils.toWei('0.5', 'Ether'), { from: buyer })
            const event = result.logs[0].args
            assert.equal(event._propID.toNumber(), propertyCount.toNumber(), 'propID is correct')
            assert.equal(event._buyer, buyer, 'buyer is correct')
            assert.equal(event._amount, '500000000000000000', 'value is correct')
        })

        it('accepts offers and creates escrows', async () => {
            const result = await marketplace.acceptOffer(propertyCount, buyer, { from: seller })
            const event = result.logs[0].args
            assert.equal(event._propID.toNumber(), propertyCount.toNumber(), 'propID is correct')
            assert.equal(event._propOwner, seller, 'owner is correct')
            assert.equal(event._buyer, buyer, 'buyer is correct')

            //test failures
            await marketplace.acceptOffer(propertyCount, seller, { from: seller }).should.be.rejected;
        })

        it('sells property', async () => {
            //track seller balance before purchase
            var oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            //check for transfer
            result = await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') })
            const event = result.logs[0].args
            assert.equal(event._propID.toNumber(), propertyCount.toNumber(), 'propID is correct')
            assert.equal(event._propOwner, buyer, 'new owner is correct')
            assert.equal(event._amount, '500000000000000000', 'price is correct')

            //check new seller balance after purchase
            var newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)
            var price = web3.utils.toWei('0.5', 'Ether')
            price = new web3.utils.BN(price)
            var expectedBalance = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(), expectedBalance.toString())

            //test failures
            await marketplace.purchaseProperty('', { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
            await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('0.2', 'Ether') }).should.be.rejected;
            await marketplace.purchaseProperty(propertyCount, { from: deployer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
            await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
        })

    })

})
