import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { enableCors } from "../../cors";

const dynamoDb = new DocumentClient();

export const _addCompany = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const offices = body.offices.map((office: any) => {
    const phones = office.phones.map((phone: string) => {
      return {
        number: phone,
        type: "",
      };
    });

    const zones = office.zones.map((zone: any) => {
      return {
        zoneId: zone.id,
        name: zone.name,
        postalCodes: zone.postal_codes,
      };
    });

    return {
      officeId: office.id,
      name: office.name,
      address: office.address,
      email: office.email,
      phones: phones,
      zones: zones,
    };
  });

  const licenses = body.services.reduce((allLicenses: any[], service: any) => {
    const serviceLicenses = service.licenses.map((license: any) => {
      return {
        licenseId: license.id,
        name: license.name,
        number: license.number,
        url: license.url,
      };
    });

    return allLicenses.concat(serviceLicenses);
  }, []);

  const services = body.services.map((service: any) => {
    return {
      serviceId: service.id,
      name: service.name,
      npiNumber: service.npi_number,
      medicalNumber: service.medical_number,
    };
  });

  const company = {
    name: body.name,
    description: body.description,
    url: body.url,
    logo: {
      main: body.logo.main,
      app: body.logo.app,
      web: body.logo.web,
    },
    services: services,
    offices: offices,
    licenses: licenses,
  };

  const params = {
    TableName: "companyTable",
    Item: {
      companyId: body.company_id,
      company: company,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Company record added successfully" }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add company record" }),
    };
  }
};

export const _getCompany = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const companyId = event.pathParameters?.companyId;

  const params = {
    TableName: "companyTable",
    Key: {
      companyId: companyId,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get company record" }),
    };
  }
};

export const getCompanyHandler = enableCors(_getCompany);

export const addCompany = enableCors(_addCompany);

/*
{
	"name": "ABC Healthcare",
	"description": "A healthcare company providing quality services.",
	"url": "https://www.abchealthcare.com",
	"logo": {
		"main": "https://www.abchealthcare.com/logo.png",
		"app": "https://www.abchealthcare.com/logo_app.png",
		"web": "https://www.abchealthcare.com/logo_web.png"
	},
	"services": [{
			"id": 1,
			"name": "Home Health",
			"npi_number": "1234567890",
			"medical_number": "HHA12345",
			"licenses": [{
					"id": 1,
					"name": "State License",
					"number": "ABC123",
					"url": "https://www.abchealthcare.com/licenses/abc123.pdf"
				},
				{
					"id": 2,
					"name": "Federal License",
					"number": "XYZ987",
					"url": "https://www.abchealthcare.com/licenses/xyz987.pdf"
				}
			]
		},
		{
			"id": 2,
			"name": "Hospice",
			"npi_number": "0987654321",
			"medical_number": "HP12345",
			"licenses": [{
					"id": 3,
					"name": "State License",
					"number": "DEF123",
					"url": "https://www.abchealthcare.com/licenses/def123.pdf"
				},
				{
					"id": 4,
					"name": "Federal License",
					"number": "MNO987",
					"url": "https://www.abchealthcare.com/licenses/mno987.pdf"
				}
			]
		}
	],
	"offices": [{
			"id": 1,
			"name": "Headquarters",
			"address": "123 Main St, Anytown USA",
			"email": "hq@abchealthcare.com",
			"phones": [
				"+1-555-123-4567",
				"+1-555-987-6543"
			],
			"zones": [{
					"id": 1,
					"name": "Zone 1",
					"postal_codes": [
						"12345",
						"12346",
						"12347"
					]
				},
				{
					"id": 2,
					"name": "Zone 2",
					"postal_codes": [
						"23456",
						"23457",
						"23458"
					]
				}
			]
		},
		{
			"id": 2,
			"name": "Branch Office",
			"address": "456 Oak St, Anytown USA",
			"email": "branch@abchealthcare.com",
			"phones": [
				"+1-555-555-1212"
			],
			"zones": [{
				"id": 1,
				"name": "Zone 1",
				"postal_codes": [
					"12345",
					"12346",
					"12347"
				]
			}]
		}
	]
}
 */
