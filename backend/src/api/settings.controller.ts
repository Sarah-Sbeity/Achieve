import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

const COMPANY_PROFILE_KEY = 'company_profile';

export interface CompanyProfileDto {
  departments?: string[];
  tenureOptions?: string[];
  ageGroupOptions?: string[];
  genderOptions?: string[];
  nationalityOptions?: string[];
  numberOfEmployeesOptions?: string[];
  industryOptions?: string[];
}

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('company-profile')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getCompanyProfile(): Promise<CompanyProfileDto> {
    const row = await this.prisma.appSettings.findUnique({
      where: { key: COMPANY_PROFILE_KEY },
    });
    if (!row || !row.value) {
      return {};
    }
    try {
      return JSON.parse(row.value) as CompanyProfileDto;
    } catch {
      return {};
    }
  }

  /** Map survey question label (lowercase) to company profile key and options array. */
  private static getOptionsForLabel(
    label: string,
    body: CompanyProfileDto,
  ): string[] | null {
    const key = (label || '').toLowerCase().trim();
    if (key === 'department') return body.departments ?? null;
    if (key === 'tenure') return body.tenureOptions ?? null;
    if (key === 'age group') return body.ageGroupOptions ?? null;
    if (key === 'gender') return body.genderOptions ?? null;
    if (key === 'nationality') return body.nationalityOptions ?? null;
    if (key === 'number of employees' || key === 'employees') return body.numberOfEmployeesOptions ?? null;
    if (key === 'industry') return body.industryOptions ?? null;
    return null;
  }

  @Put('company-profile')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async putCompanyProfile(@Body() body: CompanyProfileDto): Promise<CompanyProfileDto> {
    const value = JSON.stringify({
      departments: Array.isArray(body.departments) ? body.departments : [],
      tenureOptions: Array.isArray(body.tenureOptions) ? body.tenureOptions : [],
      ageGroupOptions: Array.isArray(body.ageGroupOptions) ? body.ageGroupOptions : [],
      genderOptions: Array.isArray(body.genderOptions) ? body.genderOptions : [],
      nationalityOptions: Array.isArray(body.nationalityOptions) ? body.nationalityOptions : [],
      numberOfEmployeesOptions: Array.isArray(body.numberOfEmployeesOptions) ? body.numberOfEmployeesOptions : [],
      industryOptions: Array.isArray(body.industryOptions) ? body.industryOptions : [],
    });
    await this.prisma.appSettings.upsert({
      where: { key: COMPANY_PROFILE_KEY },
      create: { key: COMPANY_PROFILE_KEY, value },
      update: { value },
    });
    // Sync options to survey demographic questions so the survey form shows these choices
    const allSections = await this.prisma.surveySection.findMany({
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    const sections = allSections.filter(
      (s) => (s.title || '').toLowerCase().includes('demographic'),
    );
    for (const sec of sections) {
      for (const q of sec.questions) {
        const opts = SettingsController.getOptionsForLabel(q.label, body);
        if (opts && Array.isArray(opts) && opts.length > 0) {
          await this.prisma.surveyQuestion.update({
            where: { id: q.id },
            data: { options: JSON.stringify(opts) },
          });
        }
      }
    }
    return this.getCompanyProfile();
  }
}
