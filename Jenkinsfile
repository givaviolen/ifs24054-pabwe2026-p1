pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
  }

  environment {
    // Pastikan Bun ada di PATH agent Jenkins (lihat catatan di README)
    PATH = "${env.HOME}/.bun/bin:${env.PATH}"
    DB_PATH = ':memory:' // SQLite in-memory saat testing: tanpa server DB eksternal
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Verifikasi Bun') {
      steps { sh 'bun --version' }
    }

    stage('Back-End: Install & Test') {
      steps {
        dir('backend') {
          sh 'bun install'
          sh 'bun test'
        }
      }
    }

    stage('Front-End: Install & Build') {
      steps {
        dir('frontend') {
          sh 'bun install'
          sh 'bun run build'
        }
      }
    }

    stage('Arsip Artefak') {
      steps {
        archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
      }
    }
  }

  post {
    success { echo 'Pipeline sukses: test lulus dan build front-end selesai.' }
    failure { echo 'Pipeline gagal: periksa Console Output.' }
  }
}
