import { loadFeature, defineFeature } from 'jest-cucumber';
import supertest from 'supertest';
import faker from 'faker';

const feature = loadFeature('features/petStore.feature');

const baseUrl = 'https://petstore.swagger.io/v2';
const petStoreEndpoint = '/pet';
const request = supertest(baseUrl);
const sampleDogImage = 'https://pixabay.com/images/id-4372036/';
const sampleCatImage = 'https://pixabay.com/images/id-2934720/';
const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

defineFeature(feature, (test) => {
    test('Add a new pet to the store', ({ given, when, then }) => {
        const petId = Date.now();

        console.log(petId);

        const payload = {
            id: petId,
            category: {
                id: 0,
                name: 'dogs',
            },
            name: faker.name.firstName(),
            photoUrls: [sampleDogImage],
            tags: [
                {
                    id: 0,
                    name: 'dog',
                },
            ],
            status: 'available',
        };

        when('I add a new pet', async () => {
            const response = await request
                .post(petStoreEndpoint)
                .send(headers)
                .send(payload);
            expect(response.body).not.toBe(null);
            expect(response.status).toEqual(200);
        });

        then('I can find my new pet in the store', async () => {
            const response = await request
                .get(`${petStoreEndpoint}/${petId}`)
                .set(headers);
            expect(response.status).toEqual(200);
            expect(response.body).not.toBe(null);
            expect(response.body.id).toEqual(petId);
            expect(response.body.name).toEqual(payload.name);
        });
    });

    async function findPetById() {
        const response = await request
            .get(`${petStoreEndpoint}/${petId}`)
            .set(headers);
        expect(response.status).toEqual(404);
        expect(response.body.type).toEqual('error');
        expect(response.body.message).toContain('Pet not found');
    }

    test('Adding a new pet without name should fail', ({
        given,
        when,
        then,
    }) => {
        const petId = Date.now();

        const payload = {
            id: petId,
            category: {
                id: 0,
                name: 'cats',
            },
            /* missing name */
            photoUrls: [sampleCatImage],
            tags: [
                {
                    id: 0,
                    name: 'cat',
                },
            ],
            status: 'available',
        };

        when('I add new pet without name', async () => {
            const response = await request
                .post(petStoreEndpoint)
                .set(headers)
                .send(payload);
            expect(response.status).toEqual(405);
            expect(response.body.type).toEqual('error');
        });

        then("I can't find my new pet in the store", async () => {
            findPetById();
        });
    });

    test('Adding a new pet without photo should fail', ({
        given,
        when,
        then,
    }) => {
        const petId = Date.now();

        const payload = {
            id: petId,
            category: {
                id: 0,
                name: 'cats',
            },
            name: faker.name.firstName(),
            /* missing photo */
            tags: [
                {
                    id: 0,
                    name: 'cat',
                },
            ],
            status: 'available',
        };

        when('I add new pet without photo', async () => {
            const response = await request
                .post(petStoreEndpoint)
                .set(headers)
                .send(payload);
            expect(response.status).toEqual(405);
            expect(response.body.type).toEqual('error');
        });

        then("I can't find my new pet in the store", async () => {
            findPetById();
        });
    });
});
