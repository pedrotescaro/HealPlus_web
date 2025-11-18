import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { patientService } from '../services/api';

const PatientsPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
  });

  const loadPatients = useCallback(async () => {
    try {
      const data = await patientService.getAll(token);
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.age) newErrors.age = t('validation.ageRequired');
    if (parseInt(formData.age) < 0 || parseInt(formData.age) > 150) {
      newErrors.age = t('validation.ageInvalid');
    }
    if (!formData.contact.trim()) newErrors.contact = t('validation.contactRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      await patientService.create(
        {
          ...formData,
          age: parseInt(formData.age),
        },
        token
      );
      setShowModal(false);
      setFormData({ name: '', age: '', gender: 'male', contact: '' });
      setError('');
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || t('messages.error'));
    } finally {
      setFormLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact.includes(searchTerm)
  );

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen={false} message={t('common.loading')} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('patients.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredPatients.length} {t('patients.patientsTotal')}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('patients.addNew')}
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder={t('patients.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              hover
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {patient.name}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">{t('patients.age')}:</span> {patient.age} anos
                    </p>
                    <p>
                      <span className="font-medium">{t('patients.gender')}:</span>{' '}
                      {t(`patients.${patient.gender}`)}
                    </p>
                    <p>
                      <span className="font-medium">{t('patients.contact')}:</span> {patient.contact}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
              >
                {t('patients.viewDetails')}
              </Button>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 mt-2">
                {searchTerm ? t('patients.noResults') : t('patients.noPatients')}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setError('');
        }}
        title={t('patients.addNew')}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setError('');
              }}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={formLoading}
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </>
        }
      >
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-4"
          />
        )}

        <form className="space-y-4">
          <Input
            label={t('patients.name')}
            name="name"
            placeholder={t('patients.namePlaceholder')}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            label={t('patients.age')}
            name="age"
            type="number"
            placeholder="0"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('patients.gender')} <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">{t('patients.male')}</option>
              <option value="female">{t('patients.female')}</option>
              <option value="other">{t('patients.other')}</option>
            </select>
          </div>

          <Input
            label={t('patients.contact')}
            name="contact"
            placeholder="(11) 9999-9999"
            value={formData.contact}
            onChange={handleChange}
            error={errors.contact}
            required
          />
        </form>
      </Modal>
    </Layout>
  );
};

export default PatientsPage;