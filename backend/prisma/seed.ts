import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment for seeding.',
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
  }

  // Dimensions (ensure at least 3 exist for assigning to scale questions)
  const dimensionCount = await prisma.surveyDimension.count();
  let dim1: { id: string }; let dim2: { id: string }; let dim3: { id: string };
  if (dimensionCount < 3) {
    await prisma.surveyDimension.deleteMany({});
    dim1 = await prisma.surveyDimension.create({ data: { name: 'Capabilities & Competencies', order: 0 } });
    dim2 = await prisma.surveyDimension.create({ data: { name: 'Process & Governance', order: 1 } });
    dim3 = await prisma.surveyDimension.create({ data: { name: 'Technology & Tools', order: 2 } });
  } else {
    const dims = await prisma.surveyDimension.findMany({ orderBy: { order: 'asc' } });
    dim1 = dims[0]; dim2 = dims[1]; dim3 = dims[2];
  }

  // Fix orphaned foreign keys: set dimensionId/sectionId to null when the referenced row no longer exists
  const validDimensionIds = new Set((await prisma.surveyDimension.findMany({ select: { id: true } })).map((d) => d.id));
  const validSectionIds = new Set((await prisma.surveySection.findMany({ select: { id: true } })).map((s) => s.id));
  const questionsToFix = await prisma.surveyQuestion.findMany({
    where: {
      OR: [
        { dimensionId: { not: null } },
        { sectionId: { not: null } },
      ],
    },
    select: { id: true, dimensionId: true, sectionId: true },
  });
  for (const q of questionsToFix) {
    const updates: { dimensionId?: null; sectionId?: null } = {};
    if (q.dimensionId != null && !validDimensionIds.has(q.dimensionId)) updates.dimensionId = null;
    if (q.sectionId != null && !validSectionIds.has(q.sectionId)) updates.sectionId = null;
    if (Object.keys(updates).length > 0) {
      await prisma.surveyQuestion.update({ where: { id: q.id }, data: updates });
    }
  }

  // Sections and questions: only create when there are NO sections (first-time setup).
  // Never delete or overwrite existing questions so custom content is preserved.
  const sectionCount = await prisma.surveySection.count();
  if (sectionCount === 0) {
    const secDemographic = await prisma.surveySection.create({
      data: {
        title: 'Demographic',
        description: null,
        layerLabel: null,
        order: 0,
      },
    });
    const secSurvey = await prisma.surveySection.create({
      data: {
        title: 'Organizational Infrastructure',
        description:
        "This section focuses on the organization’s infrastructure, including systems, processes, tools, and governance mechanisms. The statements below explore whether these foundations support efficient work, enable responsiveness to customers and markets, and make it easy for employees to perform their roles effectively.",
        layerLabel: 'Layer 1',
        order: 1,
      },
    });

    const demographicQuestions: Array<{
      label: string;
      type: string;
      options: string | null;
      order: number;
    }> = [
      {
        label: 'Nationality',
        type: 'select',
        options: JSON.stringify([
          'Saudi Arabia',
          'Egypt',
          'Jordan',
          'UAE',
          'Kuwait',
          'Bahrain',
          'Oman',
          'Qatar',
          'Lebanon',
          'Syria',
          'Iraq',
          'Yemen',
          'Palestine',
          'Sudan',
          'Morocco',
          'Algeria',
          'Tunisia',
          'Libya',
          'Other',
        ]),
        order: 0,
      },
      { label: 'Department', type: 'text', options: null, order: 1 },
      {
        label: 'Tenure',
        type: 'select',
        options: JSON.stringify([
          'Less than 1 year',
          '1–3 years',
          '3–5 years',
          '5+ years',
        ]),
        order: 2,
      },
      {
        label: 'Gender',
        type: 'select',
        options: JSON.stringify([
          'Male',
          'Female',
          'Non-binary',
          'Prefer not to say',
          'Other',
        ]),
        order: 3,
      },
      {
        label: 'Age group',
        type: 'select',
        options: JSON.stringify(['18–24', '25–34', '35–44', '45–54', '55+']),
        order: 4,
      },
    ];

    await prisma.surveyQuestion.createMany({
      data: demographicQuestions.map((q) => ({
        ...q,
        sectionId: secDemographic.id,
      })),
    });

    const mainLabels: string[] = [];
    for (let i = 9; i <= 50; i++) mainLabels.push('Question ' + i);
    const dimensions = [dim1, dim2, dim3];
    for (let i = 0; i < mainLabels.length; i++) {
      await prisma.surveyQuestion.create({
        data: {
          label: mainLabels[i],
          type: 'scale',
          options: null,
          order: 8 + i,
          sectionId: secSurvey.id,
          dimensionId: dimensions[i % dimensions.length].id,
        },
      });
    }
  } else {
    // Backfill dimensionId for scale questions that don't have one (does not change labels)
    const scaleWithoutDim = await prisma.surveyQuestion.findMany({
      where: { type: 'scale', dimensionId: null },
      orderBy: { order: 'asc' },
    });
    if (scaleWithoutDim.length > 0) {
      const dimensions = [dim1, dim2, dim3];
      for (let i = 0; i < scaleWithoutDim.length; i++) {
        await prisma.surveyQuestion.update({
          where: { id: scaleWithoutDim[i].id },
          data: { dimensionId: dimensions[i % dimensions.length].id },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

