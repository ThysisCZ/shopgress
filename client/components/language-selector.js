import Form from 'react-bootstrap/Form';

function LanguageSelector({ languages, setLanguage }) {
    const language = localStorage.getItem('language');
    const languageId = JSON.parse(language)?.id;

    return (
        <Form.Select
            defaultValue={languageId}
            onChange={(e) => setLanguage(e.target.value)}>
            {languages.map(language => (
                <option key={language?.id} value={language?.id}>
                    {language.name}
                </option>
            ))}
        </Form.Select>
    )
}

export default LanguageSelector;