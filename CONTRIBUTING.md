# Contributing to House Price Prediction System

Thank you for considering contributing to this project! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, Node version)

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists
- Clearly describe the use case
- Explain why it would be valuable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   # Backend
   cd backend
   python -m pytest
   
   # Frontend
   cd frontend
   npm run lint
   npm run build
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new prediction endpoint"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Add docstrings for functions
- Maximum line length: 100 characters

### TypeScript (Frontend)
- Follow ESLint rules
- Use TypeScript types
- Functional components with hooks
- Use meaningful variable names

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements_api.txt
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

## Questions?

Feel free to open an issue for any questions or clarifications!

---

**Thank you for contributing!** 
